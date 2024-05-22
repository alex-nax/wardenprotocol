type NodeType = "expression" | "array";

export interface CNode {
	id: string;
	children: string[];
	parent?: string;
	range: [number, number];
	root: string;
	value: string;
	type?: NodeType;
	tokenRanges?: [number, number][];
	tokens?: string[];
}

export type RefDictionary = Record<string, CNode>;

type IsTokenized = CNode &
	Required<Pick<CNode, "tokenRanges" | "tokens" | "type">>;

interface ErrorEntry {
	node: CNode;
	tokenIndex: number;
	message: string;
	code?: string;
	value?: string;
}

type ErrorData = Record<number, ErrorEntry[]>;
type ArgumentType = "num" | "arr";

interface FunctionDescriptor {
	args: ArgumentType[];
	name: string;
}

interface OperatorDescriptor {
	precedence: number;
	value: string;
}

export const ERROR_CODES = {
	OPEN_PARENTHESIS: "ERR_OPEN_PARENTHESIS",
	CLOSE_PARENTHESIS: "ERR_CLOSE_PARENTHESIS",
	EXPECTED_ARG_TYPE: "ERR_EXPECTED_ARG_TYPE",
	UNEXPECTED_TOKEN_IN_ARRAY: "ERR_UNEXPECTED_TOKEN_IN_ARRAY",
	UNEXPECTED_TOKEN: "ERR_UNEXPECTED_TOKEN",
};

export const FNS: Record<string, FunctionDescriptor> = {
	ALL: {
		name: "all",
		args: ["arr"],
	},
	ANY: {
		name: "any",
		args: ["num", "arr"],
	},
};

export const OPS: Record<string, OperatorDescriptor> = {
	AND: {
		precedence: 1,
		value: "&&",
	},
	OR: {
		precedence: 2,
		value: "||",
	},
};

interface ACNode {
	next: ACNode[];
	parent?: ACNode;
	value: (x: string) => string | undefined;
	type: "root" | "fn" | "arg" | "op" | "group";
}

const insertOpNodes = (prev: ACNode, root: ACNode) => {
	for (const [op] of getEntries(OPS)) {
		const opNode: ACNode = {
			parent: prev,
			next: [root],
			value: () => op,
			type: "op",
		};

		prev.next.push(opNode);
	}
};

const buildGraph = () => {
	const root: ACNode = {
		parent: undefined,
		next: [],
		value: () => undefined,
		type: "root",
	};

	for (const [fn, fnDesc] of getEntries(FNS)) {
		const node: ACNode = {
			parent: root,
			next: [],
			value: () => fn,
			type: "fn",
		};

		let prev: ACNode = node;

		for (const arg of fnDesc.args) {
			const argNode: ACNode = {
				parent: prev,
				next: [],
				value: () => arg,
				type: "arg",
			};

			prev.next.push(argNode);
			prev = argNode;
		}

		insertOpNodes(prev, node);
		root.next.push(node);
	}

	const group: ACNode = {
		parent: root,
		next: [root],
		value: () => "()",
		type: "group",
	};

	root.next.push(group);

	const ref: ACNode = {
		parent: root,
		next: [],
		value: (x) => x,
		type: "arg",
	};

	insertOpNodes(ref, root);
	root.next.push(ref);
};

export const AUTOCOMPLETE_GRAPH = buildGraph();

export const isTokenized = (node?: CNode): node is IsTokenized =>
	Boolean(node?.type && node?.tokenRanges && node?.tokens);

export const errors = () => {
	const data: ErrorData = {};

	const add = (index: number, entry: ErrorEntry) => {
		if (!data[index]) {
			data[index] = [];
		}

		data[index].push(entry);
	};

	return {
		get data() {
			return data;
		},
		add,
	};
};

export const findError = (
	errors: ErrorData,
	callback: (entry: ErrorEntry, index: number) => boolean,
) => {
	for (const [_index, entries] of Object.entries(errors)) {
		const index = Number(_index);

		for (const entry of entries) {
			if (callback(entry, index)) {
				return [index, entry] as const;
			}
		}
	}
};

const trimSymbols = (value: string, symbols: string[]) => {
	let start = 0;
	let end = value.length - 1;

	while (symbols.includes(value[start])) {
		start++;
	}

	while (symbols.includes(value[end]) && end > start) {
		end--;
	}

	return value.substring(start, end + 1);
};

const normalize = (node: CNode, refs: RefDictionary) => {
	const root = refs[node.root];

	if (!root) {
		throw new Error("Root node not found");
	}

	let value = root.value.substring(node.range[0], node.range[1] + 1);

	for (let i = node.children.length - 1; i >= 0; i--) {
		const child = refs[node.children[i]];

		const before = trimSymbols(
			value.substring(0, child.range[0] - node.range[0]).trim(),
			[" ", "("],
		);

		const after = trimSymbols(
			value.substring(child.range[1] - node.range[0] + 1).trim(),
			[" ", ")"],
		);

		value = `${before ? `${before} ` : ""}${child.id}${after ? ` ${after}` : ""}`;
	}

	return trimSymbols(value, [" ", "(", ")"]);
};

const tokenize = (node: CNode, refs: RefDictionary) => {
	const normalized = normalize(node, refs);

	const root = refs[node.root];

	if (!root) {
		throw new Error("Root node not found");
	}

	// TODO lookup for FROM keyword before node
	const type: NodeType =
		normalized.indexOf(",") >= 0 ? "array" : "expression";

	let pos = node.range[0];

	const tokens =
		type === "array"
			? normalized.split(",").map((x) => x.trim())
			: normalized.split(" ").filter(Boolean);

	const tokenRanges: [number, number][] = [];

	// get range for token in original string
	for (const token of tokens) {
		if (!token) {
			tokenRanges.push([pos, pos]);
			continue;
		}

		const { search, length } =
			token in refs
				? {
						search: refs[token].value,
						length: refs[token].range[1] - refs[token].range[0],
					}
				: { search: token, length: token.length };
		const start = root.value.indexOf(search, pos);

		if (start < 0) {
			throw new Error(`Token ${token} not found`);
		}

		const end = start + length - 1; // +1 ?

		tokenRanges.push([start, end]);
		pos = end + 1;
	}

	return { tokenRanges, tokens, type };
};

export const parseCode = (code: string) => {
	const refs: Record<string, CNode> = {};

	const errs = errors();

	let count = 0;
	const getRef = () => `R${count++}`;
	const rootRef = getRef();

	refs[rootRef] = {
		id: rootRef,
		range: [0, code.length - 1],
		children: [],
		value: code,
		root: rootRef,
	};

	const parens = { "(": ")" } as const; // by closing symbol

	// build parenthesis refs
	const stack: {
		close: string;
		start: number;
		ref: string;
		parent?: string;
	}[] = [];

	for (let i = 0; i < code.length; i++) {
		const char = code[i];

		if (parens[char as keyof typeof parens]) {
			const close = parens[char as keyof typeof parens];

			const parent = stack.length ? stack[stack.length - 1].ref : rootRef;

			const ref = getRef();
			stack.push({ close, start: i, ref, parent });
		} else if (char === stack[stack.length - 1]?.close) {
			const v = stack.pop();

			if (!v) {
				errs.add(i, {
					node: refs[rootRef],
					message: "Unexpected closing parenthesis",
					tokenIndex: -1,
				});
			} else {
				refs[v.ref] = {
					id: v.ref,
					range: [v.start, i],
					value: code.slice(v.start, i + 1),
					parent: v.parent,
					children: [],
					root: rootRef,
				};
			}
		} else if (Object.values(parens).includes(char as any)) {
			errs.add(i, {
				code: ERROR_CODES.OPEN_PARENTHESIS,
				message: "Missing opening parenthesis",
				node: refs[rootRef],
				tokenIndex: -1,
			});
		}
	}

	if (stack.length) {
		errs.add(stack[stack.length - 1].start, {
			code: ERROR_CODES.CLOSE_PARENTHESIS,
			message: "Missing closing parenthesis",
			node: refs[rootRef],
			tokenIndex: -1,
		});
	}

	const refList = Object.keys(refs);

	// reverse refs
	for (const id of refList) {
		const parentId = refs[id].parent;

		if (parentId && parentId in refs) {
			refs[parentId].children.push(refs[id].id);
		}
	}

	// tokenize
	for (const id of refList) {
		const { tokenRanges, tokens, type } = tokenize(refs[id], refs);
		refs[id].tokenRanges = tokenRanges;
		refs[id].tokens = tokens;
		refs[id].type = type;
	}

	// fixme better determine arrays
	for (const id of refList) {
		const parentId = refs[id].parent;

		if (parentId && parentId in refs) {
			const parent = refs[parentId];
			const index = parent.tokens?.findIndex((x) => x === id) ?? -1;

			if (index > 0) {
				if (parent.tokens?.[index - 1].toUpperCase() === "FROM") {
					refs[id].type = "array";
				}
			}
		}
	}

	return { refs, errors: errs.data, rootRef };
};

export function hasEntries<T>(obj?: T): obj is T {
	return obj ? Boolean(Object.keys(obj).length) : false;
}

export function getFirstEntry<T>(obj?: T): [keyof T, T[keyof T]] | undefined {
	if (!hasEntries(obj)) {
		return;
	}

	const key = Object.keys(obj as any)[0] as keyof T;
	return [key, obj[key]];
}

export function getEntries<T>(obj?: T): [keyof T, T[keyof T]][] {
	if (!hasEntries(obj)) {
		return [];
	}

	return Object.entries(obj as any) as [keyof T, T[keyof T]][];
}

export const toShield = (
	node: CNode,
	refs: RefDictionary,
	addresses: string[],
) => {
	if (!node.tokens) {
		throw new Error("node not tokenized");
	}

	const errs = errors();

	if (node.type === "array") {
		return {
			errors: errs.data,
			value: `[${node.tokens
				.map((token, i) => {
					if (token.toUpperCase().startsWith("ADR")) {
						const index = parseInt(token.substring(3), 10) - 1;

						if (!Number.isFinite(index) || index < 0) {
							errs.add(i, {
								node,
								tokenIndex: i,
								message: `Expected address in ADR{number} format`,
							});

							return "false";
						} else if (!addresses[index]) {
							errs.add(i, {
								node,
								tokenIndex: i,
								message: `Address not found: ADR${index + 1}`,
							});

							return "false";
						}

						return addresses[index];
					} else {
						errs.add(i, {
							node,
							tokenIndex: i,
							message: `Unexpected token: ${token}`,
							code: ERROR_CODES.UNEXPECTED_TOKEN_IN_ARRAY,
							value: token,
						});

						return "false";
					}
				})
				.join(", ")}]`,
		};
	}

	let result = "";

	for (let i = 0; i < node.tokens.length; ++i) {
		const token: string = node.tokens[i].toUpperCase();

		if (token in refs) {
			const ref = refs[token];

			if (ref.type === "array") {
				errs.add(i, {
					node,
					tokenIndex: i,
					message: `Unexpected ref: ${token}`,
				});

				continue;
			} else {
				const { errors, value } = toShield(ref, refs, addresses);

				for (const _errors of Object.values(errors)) {
					for (const err of _errors) {
						errs.add(i, err);
					}
				}

				result += `(${value})`;
			}
		} else if (token in OPS) {
			const { value } = OPS[token as keyof typeof OPS];
			result += ` ${value} `;
		} else if (token in FNS) {
			const fn: FunctionDescriptor = FNS[token];
			const argc = fn.args.length;

			if (!argc) {
				errs.add(i, {
					node,
					tokenIndex: i,
					message: `Incorrect argc[${argc}] of function[${token}]`,
				});

				continue;
			}

			const args: string[] = [];
			++i;

			for (let j = 0; j < argc; j++) {
				const type = fn.args[j];

				switch (type) {
					case "num": {
						const tokenIndex = i + j;
						const value = node.tokens[tokenIndex];
						args.push(value);

						if (!Number.isFinite(parseInt(value, 10))) {
							errs.add(tokenIndex, {
								node,
								tokenIndex,
								// TODO first argument can be not a number for some function
								message: `${token} function expects arg[${j}] to be a number`,
								code: ERROR_CODES.EXPECTED_ARG_TYPE,
								value: "num",
							});
						}

						break;
					}

					case "arr": {
						const fromIndex = i + j;

						if (node.tokens[fromIndex]?.toUpperCase() !== "FROM") {
							errs.add(fromIndex, {
								node,
								tokenIndex: fromIndex,
								message: "FROM expected",
								code: ERROR_CODES.EXPECTED_ARG_TYPE,
								value: "util",
							});

							continue;
						}

						const arrIndex = ++i + j;
						const refId = node.tokens[arrIndex];

						if (!refs[refId]) {
							errs.add(arrIndex, {
								node,
								tokenIndex: arrIndex,
								message: `Ref[${refId}] not found`,
								code: refId
									? ERROR_CODES.UNEXPECTED_TOKEN
									: ERROR_CODES.EXPECTED_ARG_TYPE,
								value: refId ? refId : "ref",
							});

							continue;
						}

						const { errors, value } = toShield(
							refs[refId],
							refs,
							addresses,
						);

						for (const _errors of Object.values(errors)) {
							for (const err of _errors) {
								errs.add(i + j, err);
							}
						}

						args.push(value);
						break;
					}

					default: {
						errs.add(i + j, {
							node,
							tokenIndex: i + j,
							message: `Unexpected arg type: ${type}`,
							code: ERROR_CODES.EXPECTED_ARG_TYPE,
							value: type,
						});

						break;
					}
				}
			}

			i += argc - 1;
			result += `${token.toLowerCase()}(${args.join(", ")})`;
		} else if (token.toUpperCase().startsWith("ADR")) {
			// todo check correct index
			result += addresses[parseInt(token.substring(3), 10) - 1];
		} else {
			errs.add(i, {
				node,
				tokenIndex: i,
				message: `Unexpected token: ${token}`,
				code: ERROR_CODES.UNEXPECTED_TOKEN,
				value: token,
			});
		}
	}

	return { errors: errs.data, value: result };
};

export const replaceAt = (
	str: string,
	replacement: string,
	range: [number, number],
) => {
	const start = str.substring(0, range[0]);
	const end = str.substring(range[1] + 1);
	return `${start}${replacement}${end}`;
};

export const wrapParenthesis = (wrap: boolean, value: string) =>
	wrap ? `(${value})` : value;

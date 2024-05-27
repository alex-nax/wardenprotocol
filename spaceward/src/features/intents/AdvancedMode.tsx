import { useClickOutside } from "@/hooks/useClickOutside";
import { Expression } from "@/types/shield";
import { ActionsFromState, SetAction } from "@/types/util";
import { createHumanReadableCondition } from "@/utils/shield";
import clsx from "clsx";

import {
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";

import {
	AUTOCOMPLETE_GRAPH,
	CNode,
	ERROR_CODES,
	findError,
	FNS,
	getEntries,
	hasEntries,
	isTokenized,
	OPS,
	parseCode,
	RefDictionary,
	replaceAt,
	toShield,
	wrapParenthesis,
} from "./util/code";

import { levenstein } from "./util/levenstein";
import type { ModalType } from "./types";
import AddressList from "./AddressList";

interface Result {
	code: string;
	error?: string;
	isUpdated: boolean;
}

interface InputState {
	code: string;
	focused: boolean;
	selection: number[];
	autocompleteItem: number;
}

const getPosition = (
	selection: number[],
	prevSelection?: number[] | undefined,
) => {
	if (selection[0] === selection[1] || !prevSelection) {
		return selection[0];
	}

	const index = selection.findIndex((v, i) => v !== prevSelection[i]);
	return index === -1 ? selection[0] : selection[index];
};

const reducer = (
	state: InputState,
	action:
		| ActionsFromState<InputState, keyof InputState>
		| SetAction<InputState>,
) =>
	action.type === "set"
		? { ...state, ...action.payload }
		: { ...state, [action.type]: action.payload };

interface AutocompleteParams {
	addresses: string[];
	index?: number;
}

interface Suggestion {
	value: string | ((params: AutocompleteParams) => string);
	description?: string | ((params: AutocompleteParams) => string);
	tags: string[];
	multi?: keyof Omit<AutocompleteParams, "index"> | number;
	prefix?: boolean;
}

const getTokenPosition = (index: number, node: CNode) => {
	if (!isTokenized(node)) {
		throw new Error("current node not initialized");
	}

	if (index === -1) {
		return node.range[1];
	}

	return node.tokenRanges[index][0];
};

const findByPosition = (pos: number, refs: RefDictionary) => {
	const root =
		refs[
			// fixme no hardcoded root ref
			"R0"
		];

	let parent: CNode | undefined;
	let node = root; // start from root

	while (true) {
		if (pos < node.range[0] || pos > node.range[1]) {
			// throw new Error(`position ${pos} out of node range ${node.range}`);

			if (!isTokenized(node)) {
				throw new Error(`node ${node.id} not initialized`);
			}

			if (node.id !== root.id) {
				throw new Error(
					`position ${pos} out of node range ${node.range}`,
				);
			}

			const [tokenRange] = node.tokenRanges.slice(-1);

			return {
				index: -1,
				node,
				parent,
				prev: tokenRange?.[1]
					? pos === tokenRange[1] + 1
						? node.tokens.length - 1
						: -1
					: -1,
			};
		}

		let inChildren = false;

		for (const child of node.children) {
			if (pos >= refs[child].range[0] && pos <= refs[child].range[1]) {
				parent = node;
				node = refs[child];
				inChildren = true;
				break;
			}
		}

		if (!inChildren) {
			break;
		}
	}

	if (!isTokenized(node)) {
		throw new Error(`node ${node.id} not initialized`);
	}

	let index = -1;
	let prev = -1;

	for (let i = 0; i < node.tokenRanges.length; i++) {
		const range = node.tokenRanges[i];

		if (pos <= range[1] && pos >= range[0]) {
			index = i;
			break;
		} else if (range[0] > pos && prev >= 0) {
			const pRange = node.tokenRanges[prev];

			if (pRange[1] < pos) {
				break;
			}
		}

		prev = i;
	}

	return { index, node, parent, prev };
};

interface ParseResult {
	ok: boolean;
	result?: ReturnType<typeof parseCode>;
	message?: string;
}

const SUGGESTIONS: Suggestion[] = [
	{ value: "ANY", tags: ["root", "call"] },
	{ value: "ALL", tags: ["root", "call"] },
	{ value: "()", tags: ["root", "group", "array"] },
	{ value: "AND", tags: ["op"] },
	{ value: "OR", tags: ["op"] },
	{
		value: ({ index }) =>
			typeof index === "number" ? `ADR${index + 1}` : "ADR",
		description: ({ addresses, index }) =>
			typeof index === "number" ? addresses[index] : "",
		tags: ["ref", "root"],
		multi: "addresses",
	},
	{
		value: ({ index }) =>
			typeof index === "number" ? `${index + 1}` : "NaN",
		tags: ["num"],
		multi: 5,
	},
	{ value: "FROM", tags: ["util"] },
	{
		value: "(",
		description: "Add open parenthesis",
		tags: ["error", "open_parenthesis"],
		prefix: true,
	},
	{
		value: ")",
		description: "Add close parenthesis",
		tags: ["error", "close_parenthesis"],
	},
];

const useInput = (code: string, params?: Omit<AutocompleteParams, "index">) => {
	const prev = useRef<InputState | null>(null);

	const [state, dispatch] = useReducer(reducer, {
		code,
		autocompleteItem: 0,
		focused: false,
		selection: [0, 0],
	});

	const position = getPosition(state.selection, prev.current?.selection);

	const parsed: ParseResult = useMemo(() => {
		try {
			// const node = jsep(state.code);
			const result = parseCode(state.code);
			return { ok: true, result };
		} catch (e) {
			return { ok: false, message: (e as Error).message };
		}
	}, [state.code]);

	const ref = useRef<HTMLInputElement | null>(null);

	const _node = useMemo(
		() =>
			parsed.result && !Object.keys(parsed.result.errors).length
				? findByPosition(position, parsed.result.refs)
				: undefined,
		[position, parsed.result],
	);

	const shield = useMemo(() => {
		if (!parsed.result || hasEntries(parsed.result.errors)) {
			return undefined;
		}

		const { refs, rootRef } = parsed.result;
		const root = refs[rootRef];
		return toShield(root, refs, params?.addresses ?? []);
	}, [parsed.result, params?.addresses]);

	const suggest: {
		tags: string[];
		val?: string;
		type: "replace" | "next" | "insert";
		threshold?: number;
	} = useMemo(() => {
		const tags = new Set<string>(["root"]);
		const refs = parsed.result?.refs;
		let type: "replace" | "next" | "insert" = "replace";

		if (hasEntries(parsed.result?.errors)) {
			type = "insert";

			for (const [charAt, errs] of getEntries(parsed.result.errors)) {
				for (const err of errs) {
					switch (err?.code) {
						case ERROR_CODES.CLOSE_PARENTHESIS:
							if (position >= charAt) {
								tags.delete("root");
								tags.add("error");
								tags.add("close_parenthesis");
							}

							break;
						case ERROR_CODES.OPEN_PARENTHESIS:
							if (position <= charAt) {
								tags.delete("root");
								tags.add("error");
								tags.add("open_parenthesis");
							}

							break;
						default:
					}
				}
			}

			return { tags: Array.from(tags), type };
		}

		if (!isTokenized(_node?.node) || !refs) {
			return { tags: Array.from(tags), type };
		}

		const { node, prev } = _node;
		let index = _node.index;

		if (index < 0) {
			if (typeof prev === "number" && prev >= 0) {
				const range = node.tokenRanges[prev];

				if (position === range[1] + 1) {
					index = prev;
				} else {
					type = "next";
				}
			} else {
				type = "next";
			}
		}

		const acRoot = AUTOCOMPLETE_GRAPH;
		let acNode = acRoot;
		let found = false;

		for (let i = 0; i <= index; i++) {
			const token = node.tokens[i];
			found = false;

			for (const next of acNode.next) {
				const value = next.value(/* fixme adr */ "");
				// console.log({ next }, next.value(""));
				switch (next.type) {
					case "arg":
						if (value === "num") {
							if (Number.isFinite(parseInt(token))) {
								acNode = next;
								found = true;
								break;
							}
						} else if (value === "arr") {
							console.log({ token, value})

						}

						break;

					default:
						console.log(next, value)
						if (value?.toLowerCase() === token.toLowerCase()) {
							acNode = next;
							found = true;
							break;
						}
				}
			}

			console.log({ found, acNode });

			if (!found) {
				break;
			}
		}

		console.log(
			acNode.next.map((x) => x.value("")),
			type,
			found,
		);

		if (found) {
			type = "next";
		}

		if (hasEntries(shield?.errors)) {
			for (const [index, errs] of getEntries(shield.errors)) {
				for (const err of errs) {
					switch (err.code) {
						case ERROR_CODES.UNEXPECTED_TOKEN_IN_ARRAY: {
							return { tags: ["ref"], type: "replace" };
						}

						case ERROR_CODES.UNEXPECTED_TOKEN: {
							console.log({ index, err });
							if (err.value) {
								return {
									tags: [],
									type:
										_node.index >= 0
											? "replace"
											: _node.prev >= 0
												? "replace"
												: "next",
									val: err.value,
									threshold: err.value.length,
								};
							}

							break;
						}

						case ERROR_CODES.EXPECTED_ARG_TYPE: {
							if (err.value) {
								return { tags: [err.value], type };
							}

							break;
						}
						default:
							break;
					}
				}
			}
		}

		if (node?.type === "array") {
			tags.add("ref");
		} else {
			if (!node.tokens?.length) {
				tags.add("root");
				return { tags: Array.from(tags), type };
			}

			if (index === 0) {
				tags.add("root");
			} else if (index < 0) {
				const token = (
					prev ? node.tokens[prev] : node.tokens.slice(-1)[0]
				)?.toUpperCase();

				if (token in refs) {
					tags.add("op");
				} else if (token in OPS) {
					tags.add("call");
					tags.add("group");
				} else if (token in FNS) {
					tags.add(token === "ALL" ? "util" : "num");
				}
			}
		}

		const token = index >= 0 ? node.tokens[index] : undefined;
		return { tags: Array.from(tags), val: token, type };
	}, [
		_node,
		parsed.result?.refs,
		parsed.result?.errors,
		position,
		shield?.errors,
	]);

	const suggestions = useMemo(() => {
		const THRESHOLD = suggest.threshold ?? 2;
		const searchValue = suggest.val?.toUpperCase();

		const items = SUGGESTIONS.flatMap((x) => {
			const getValue = (v: typeof x, params: AutocompleteParams) => {
				const value =
					typeof v.value === "function" ? v.value(params) : v.value;

				return {
					...x,
					value,
					description:
						typeof v.description === "function"
							? v.description(params)
							: v.description,
					distance: searchValue ? levenstein(searchValue, value) : 0,
				};
			};

			const _params = { addresses: params?.addresses ?? [] };

			const num = x.multi
				? typeof x.multi === "number"
					? x.multi
					: params?.[x.multi].length ?? undefined
				: undefined;

			return num
				? Array.from({ length: num }).map((_, index) =>
						getValue(x, { ..._params, index }),
					)
				: getValue(x, _params);
		});

		return items
			.filter((x) => {
				if (!suggest.tags.every((tag) => x.tags.includes(tag))) {
					return false;
				}

				if (suggest.val) {
					return x.distance! <= THRESHOLD;
				}

				return true;
			})
			.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
	}, [suggest, params?.addresses, shield?.errors]);

	const autoComplete = useCallback(
		(i: number) => {
			const item = suggestions[i];
			const refs = parsed.result?.refs;

			if (!item || !refs) {
				return;
			}

			if (suggest.type === "insert") {
				const value = " " + item.value;
				const _code = replaceAt(
					state.code,
					value,
					item.prefix
						? [position - 1, position - 1]
						: [position, position],
				);

				dispatch({
					type: "code",
					payload: _code,
				});

				setTimeout(() =>
					setPosition(
						item.prefix ? position : position + value.length,
					),
				);
				return;
			}

			if (suggest.type === "next") {
				const {
					node: { tokens, tokenRanges, range, type, id, root },
					prev,
				} = _node!;

				const _tokens = [...tokens];
				let at: number;

				if (typeof prev === "number") {
					// fixme proper position
					_tokens.splice(prev + 1, 0, item.value);
					at = (tokenRanges[prev]?.[1] ?? -1) + 1;
				} else {
					_tokens.push(item.value);
					at = range[1] + 1;
				}

				const value = wrapParenthesis(
					id !== root,
					_tokens
						.map((x) => (x in refs ? refs[x].value : x))
						.filter(Boolean)
						.join(type === "array" ? ", " : " "),
				);

				const dPos = value.length - range[1] + range[0];
				const _code = replaceAt(state.code, value, range);

				dispatch({
					type: "code",
					payload: _code,
				});

				setTimeout(() => setPosition(at + dPos));
			} else {
				const { node, index: _index, prev } = _node!;

				// hotfix for end of token
				const index =
					_index < 0
						? typeof prev === "number"
							? prev
							: -1
						: _index;

				if (!node || index < 0 || !node.tokens) {
					return;
				}

				const _tokens = [...node.tokens];
				const range = node.tokenRanges[index];
				const dPos = item.value.length - range[1] + range[0];
				_tokens[index] = item.value;

				const value = _tokens
					.map((x) => (x in refs ? refs[x].value : x))
					.filter(Boolean)
					.join(node.type === "array" ? ", " : " ");

				const _code = replaceAt(
					state.code,
					wrapParenthesis(node.id !== node.root, value),
					node.range,
				);

				dispatch({
					type: "code",
					payload: _code,
				});

				setTimeout(() => setPosition(range[1] + dPos));
			}
		},
		[suggestions, suggest.type, _node, position, parsed.result?.refs],
	);

	const numSuggest = suggestions.length;

	useEffect(() => {
		dispatch({ type: "autocompleteItem", payload: 0 });
	}, [numSuggest]);

	const updateSelection = useCallback(() => {
		const elem = ref.current;

		if (
			!elem ||
			typeof elem.selectionStart !== "number" ||
			typeof elem.selectionEnd !== "number"
		) {
			return;
		}

		const selection = [elem.selectionStart, elem.selectionEnd];
		dispatch({ type: "selection", payload: selection });
	}, []);

	const setPosition = useCallback(
		(pos: number) => {
			const elem = ref.current;

			if (!elem) {
				return;
			}

			elem.setSelectionRange(pos, pos);
			updateSelection();
			elem.focus();
		},
		[updateSelection],
	);

	const handlers = useMemo(
		() =>
			({
				onFocus: () => {
					updateSelection();
					dispatch({ type: "focused", payload: true });
				},
				onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
					if (e.key === "ArrowDown") {
						e.preventDefault();

						const next = (state.autocompleteItem + 1) % numSuggest;
						dispatch({ type: "autocompleteItem", payload: next });
					} else if (e.key === "ArrowUp") {
						e.preventDefault();

						const next =
							(state.autocompleteItem - 1 + numSuggest) %
							numSuggest;

						dispatch({ type: "autocompleteItem", payload: next });
					} else if (e.key === "Enter") {
						autoComplete(state.autocompleteItem);
					}

					updateSelection();
				},
				onKeyUp: () => {
					updateSelection();
				},
				onMouseDown: () => {
					updateSelection();
				},
				onMouseUp: () => {
					updateSelection();
				},
			}) as const,
		[updateSelection, state.autocompleteItem, suggestions, autoComplete],
	);

	useEffect(() => {
		prev.current = state;
	}, [state]);

	return {
		handlers,
		node: _node,
		position,
		parsed,
		ref,
		shield,
		state,
		suggestions,
		dispatch,
		updateSelection,
		setPosition,
		autoComplete,
	};
};

export default function AdvancedMode({
	addresses: _addresses,
	children,
	expression,
	hideHeader,
	toggleChangeAddresses,
}: {
	addresses?: string[];
	children?: (v: Result) => ReactNode;
	expression: Expression;
	hideHeader?: boolean;
	toggleChangeAddresses: (
		addresses: string[],
		type: ModalType,
		onChange?: (addresses: string[]) => void,
	) => void;
}) {
	const humanReadable = useMemo(
		() => createHumanReadableCondition(expression),
		[expression],
	);

	const [addresses, setAddresses] = useState(_addresses ?? []);
	const input = useInput(humanReadable.code, { addresses });
	const isUpdated = input.state.code !== humanReadable.code;

	const formRef = useRef<HTMLFormElement | null>(null);

	useClickOutside(formRef, () => {
		input.dispatch({ type: "focused", payload: false });
	});

	function onCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
		const value = event.target.value;
		input.dispatch({ type: "code", payload: value });
	}

	const error = useMemo(() => {
		const parseErrors = input.parsed.result?.errors;

		if (hasEntries(parseErrors)) {
			for (const [index, entries] of Object.entries(parseErrors)) {
				const i = Number(index);
				const [entry] = entries;

				return {
					type: "parseError" as const,
					i,
					...entry,
				};
			}
		}

		const shield = input.shield;

		if (!shield?.errors) {
			return undefined;
		}

		// fixme 3 iterations sounds like overkill
		const error =
			findError(shield.errors, (entry) => {
				return (
					entry.node.id === input.node?.node.id &&
					entry.tokenIndex === input.node.index
				);
			}) ??
			findError(
				shield.errors,
				(entry) => entry.node.id === input.node?.node.id,
			) ??
			findError(shield.errors, () => true);

		if (error) {
			return {
				type: "shieldError" as const,
				i: error[0],
				...error[1],
			};
		}
	}, [input.node, input.shield, input.parsed.result?.errors]);

	return (
		<div>
			{!hideHeader ? (
				<div className="mt-4 mb-4">
					<div className="text-xl bg-transparent flex justify-between items-center font-bold">
						Advanced mode
					</div>
					<div className="text-[rgba(229,238,255,0.60)] mt-1">
						Use an expression to set approval conditions
					</div>
				</div>
			) : null}

			<AddressList
				addresses={addresses}
				onChange={setAddresses}
				onAdd={() =>
					toggleChangeAddresses(addresses, "person", setAddresses)
				}
			/>

			{true /* DEBUG INFO */ ? (
				<div className="flex w-1">
					<pre>
						{JSON.stringify(
							{
								parseError: input.parsed.message,
								shieldError: input.shield?.errors,
								error,
								// error,
								pos: input.position,
								index: input.node?.index,
								prev: input.node?.prev,
								range: input.node?.node.range,
								parentRange: input.node?.parent?.range,
								// tokenRanges: input.node?.node.tokenRanges,
								tokens: input.node?.node.tokens.join(" "),
								id: input.node?.node.id,
								// parentTokenRanges:
								// 	input.node?.parent?.tokenRanges,
								// parentTokens:
								//	input.node?.parent?.tokens,
							},
							null,
							2,
						)}
					</pre>
				</div>
			) : null}
			<form
				onSubmit={(e) => e.preventDefault()}
				action=""
				className={clsx(
					`relative mt-8 text-left flex items-center justify-between gap-2 bg-[rgba(229,238,255,0.15)] px-4 h-[60px]`,
				)}
				ref={formRef}
			>
				<div className="w-full flex items-center gap-[6px]">
					<label
						className="text-[rgba(229,238,255,0.60)] text-xs"
						htmlFor="address"
					>
						f(x)
					</label>

					<input
						autoComplete="off"
						className="block w-full bg-transparent outline-none focus:outline-none"
						id="code"
						onChange={onCodeChange}
						value={input.state.code}
						ref={input.ref}
						{...input.handlers}
						placeholder="Write condition"
					/>

					<div
						className={clsx(
							"absolute top-[64px] left-0",
							"flex flex-col w-full z-10",
							"bg-[#302F36] text-white",
							{
								hidden: !input.state.focused,
							},
						)}
					>
						{
							/* fixme pass parenthesis parsing error at position */ error ||
							input.parsed.message ? (
								<div
									className={clsx(
										"flex justify-center flex-col h-12 w-full px-3 cursor-pointer text",
										"text-[#E54545]",
									)}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();

										if (error) {
											const position =
												error.type === "parseError"
													? error.i
													: getTokenPosition(
															error.tokenIndex,
															error.node,
														);

											input.setPosition(position);
										}
									}}
								>
									<p>
										{error?.message ?? input.parsed.message}{" "}
									</p>
								</div>
							) : null
						}
						{input.suggestions.map(({ value, description }, i) => {
							const selected = input.state.autocompleteItem === i;

							return (
								<div
									key={`${i}${value}`}
									className={clsx(
										"flex justify-center flex-col h-12 w-full px-3 cursor-pointer",
										"hover:bg-[rgba(229,238,255,0.15)]",
										{
											"bg-[rgba(229,238,255,0.15)]":
												selected,
										},
									)}
									onClick={() => input.autoComplete(i)}
								>
									{value}
									{description && (
										<div className="text-xs text-[rgba(229,238,255,0.60)] leading-none">
											{description}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</form>

			{children?.({
				code: input.shield?.value ?? "",
				error: error?.message ?? input.parsed.message,
				isUpdated,
			})}
		</div>
	);
}

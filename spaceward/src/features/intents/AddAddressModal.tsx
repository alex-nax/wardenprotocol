import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { fromBech32 } from "@cosmjs/encoding";
import { ModalType } from "./types";
import { KNOWN_ADDRESSES, compareAddress, getProvider } from "@/lib/eth";
import { XIcon } from "lucide-react";
import AddressAvatar from "@/components/AddressAvatar";

const isValidBech32 = (address?: string): address is string => {
	if (!address) {
		return false;
	}

	try {
		return Boolean(fromBech32(address));
	} catch {
		return false;
	}
};

const ethRegex = /^0x[a-f0-9]{40}$/i;

const isValidEth = (address?: string): address is `0x${string}` => {
	if (!address) {
		return false;
	}

	return ethRegex.test(address);
};

type AddressType = "bech32" | "eth";

const VALIDATORS: Record<AddressType, (address: string) => boolean> = {
	bech32: isValidBech32,
	eth: isValidEth,
};

interface ValidateResult {
	ok: boolean;
	type?: AddressType;
	value?: string;
}

const validateAddress = (
	address: string,
	types: AddressType[],
): ValidateResult => {
	for (const type of types) {
		if (VALIDATORS[type](address)) {
			return { ok: true, type, value: address };
		}
	}

	return { ok: false };
};

const provider = getProvider("mainnet");

interface Info {
	name: string;
	logo?: string | null;
	known?: boolean;
}

const resolveEns = async (address: `0x${string}`) => {
	try {
		const ens = await provider.lookupAddress(address);

		if (!ens) {
			return null;
		}

		const resolver = await provider.getResolver(ens);

		if (!resolver) {
			return null;
		}

		const name = resolver.name;
		const logo = await resolver.getAvatar();

		return { name, logo } satisfies Info;
	} catch {
		return null;
	}
};

const AddAddressModal = ({
	onPrevModal,
	onDone,
	type,
}: {
	onPrevModal: () => void;
	onDone?: (address: string) => void;
	type: Exclude<ModalType, "hidden">;
}) => {
	const [addPersonValue, setAddPersonValue] = useState<string>("");
	const [info, setInfo] = useState<Info>();
	const [pending, setPending] = useState(false);

	const validation = useMemo(
		() =>
			validateAddress(
				addPersonValue,
				type === "person" ? ["bech32"] : ["eth", "bech32"],
			),
		[addPersonValue],
	);

	useEffect(() => {
		let cancel = false;

		const addr = validation.value;

		if (validation.type === "eth" && isValidEth(addr)) {
			const knownAddress = KNOWN_ADDRESSES.find(({ address }) =>
				compareAddress(address, addr),
			);

			if (!knownAddress) {
				setPending(true);
				resolveEns(addr).then((data) => {
					setPending(false);

					if (!data || cancel) {
						setInfo(undefined);
						return;
					}

					setInfo(data);
				});
			} else {
				setInfo({ known: true, ...knownAddress });
			}

			return () => {
				cancel = true;
			};
		}
	}, [validation]);

	function pasteFromClipboard(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();

		if (!navigator?.clipboard) {
			console.error("Clipboard API not available");
			return;
		}

		navigator.clipboard
			.readText()
			.then((text) => {
				setAddPersonValue(text);
			})
			.catch((err) => {
				console.error("Failed to read clipboard contents: ", err);
			});
	}

	return (
		<div className="max-w-[520px] w-[520px] text-center tracking-widepb-5">
			<div className="font-display text-5xl mb-6 leading-[56px]">
				Add {type === "person" ? "an approver" : "a whitelist address"}
			</div>

			<div>Enter an address</div>

			<form
				action=""
				className={clsx(
					`mt-12 text-left flex items-center justify-between gap-2 bg-[rgba(229,238,255,0.15)] border-[1px] border-white px-4 h-[60px]`,
					!validation.ok &&
						addPersonValue &&
						`border-[#E54545] border-[1px]`,
				)}
			>
				{info ? (
					<div className="h-10 w-10 min-w-[40px] rounded-full bg-[rgba(255,174,238,0.15)] items-center justify-center flex text-[#FFAEEE] text-xl">
						{info.logo ? (
							<img
								src={info.logo}
								alt={info.name}
								className="h-10 w-10 rounded-full"
							/>
						) : (
							<AddressAvatar seed={addPersonValue} />
						)}
					</div>
				) : null}
				<div className="w-full">
					<label
						className="text-[rgba(229,238,255,0.60)] text-xs"
						htmlFor="address"
					>
						Address
					</label>
					<input
						className="block w-full bg-transparent outline-none foces:outline-none"
						id="address"
						onChange={(e) => setAddPersonValue(e.target.value)}
						value={addPersonValue}
					/>
				</div>
				{!validation.ok ? (
					<button
						className="font-medium text-[rgba(229,238,255,0.60)] px-2 hover:text-white transition-all duration-200"
						onClick={pasteFromClipboard}
					>
						Paste
					</button>
				) : (
					<XIcon
						className="cursor-pointer"
						onClick={() => setAddPersonValue("")}
					/>
				)}
			</form>

			{!validation.ok && addPersonValue ? (
				<div className="text-[#E54545] text-xs text-left mt-2">
					Enter correct address
				</div>
			) : type === "whitelist" && !info?.known && addPersonValue ? (
				<div className="text-xs text-left mt-2">
					This address is unidentified and can’t be verified for risk.
				</div>
			) : (
				<div />
			)}

			<div className="mt-12 pt-6">
				<button
					onClick={() => {
						if (validation.ok && !pending) {
							onDone?.(addPersonValue);
							onPrevModal();
						}
					}}
					disabled={!validation.ok || pending}
					className={clsx(
						`bg-foreground h-14 flex items-center justify-center w-full font-semibold text-background hover:bg-accent transition-all duration-200`,
						!addPersonValue ||
							(!validation.ok &&
								`opacity-30 pointer-events-none`),
					)}
				>
					Add {type === "person" ? "Approver" : "Whitelist Address"}
				</button>
			</div>
		</div>
	);
};

export default AddAddressModal;

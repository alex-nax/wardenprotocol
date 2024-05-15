import PersonSelect from "./PersonSelect";
import { isSet } from "@/utils/validate";
import { useMemo, useState } from "react";
import { ModalType } from "./types";

interface Props {
	addresses: string[];
	users: string[];
	onClose: () => void;
	showAddPerson: () => void;
	onChange?: (users: string[]) => void;
	type: Exclude<ModalType, "hidden">;
}
const ChangeAddressesModal = ({
	addresses,
	users,
	onClose,
	showAddPerson,
	onChange,
}: Props) => {
	const [selected, setSelected] = useState<boolean[]>(() => {
		const selected = addresses.map((address) => users.includes(address));
		return selected;
	});

	const isAllSelected = useMemo(() => {
		return selected.every(Boolean);
	}, [selected]);

	const handleSelectAll = () => {
		setSelected(Array(addresses.length).fill(!isAllSelected));
	};

	return (
		<div className="max-w-[520px] w-[520px] text-center tracking-widepb-5">
			<div className="font-bold text-5xl mb-6 leading-[56px]">
				Select the approvers
			</div>
			<div>Who should approve the transactions</div>

			<div className="mt-12 flex justify-between items-center text-[rgba(229,238,255,0.60)] font-semibold">
				<button
					onClick={() => {
						showAddPerson();
					}}
					className="px-5 hover:text-white transition-all duration-200"
				>
					Add an approver
				</button>
				{addresses.length ? (
					<button
						onClick={() => handleSelectAll()}
						className="px-5 hover:text-white transition-all duration-200"
					>
						{isAllSelected ? `Deselect All` : `Select All`}
					</button>
				) : (
					<div></div>
				)}
			</div>
			<div className="flex flex-col text-left">
				{addresses
					// ?.slice(0, 4)
					.map((address, i) => (
						<PersonSelect
							address={address}
							key={`${i}${selected[i]}`}
							selected={selected[i]}
							onChange={(value) => {
								setSelected((prev) => {
									const next = [...prev];
									next[i] = value;
									return next;
								});
							}}
						/>
					))}
			</div>

			<div className="mt-12 pt-6 border-[rgba(229,238,255,0.30)] border-t-[1px]">
				<button
					onClick={() => {
						const nextUsers = selected
							.map((value, i) =>
								value ? addresses[i] : undefined,
							)
							.filter(isSet);

						if (
							JSON.stringify(nextUsers) !== JSON.stringify(users)
						) {
							onChange?.(nextUsers);
						}

						onClose();
					}}
					className="bg-[#FFF] h-14 flex items-center justify-center w-full font-semibold text-[#000] hover:bg-[#FFAEEE] transition-all duration-200"
				>
					Done
				</button>
			</div>
		</div>
	);
};

export default ChangeAddressesModal;

import AddressUnit from "@/components/AddressUnit";
import { Icons } from "@/components/ui/icons";
import clsx from "clsx";

interface AddressListProps {
	addresses: string[];
	onAdd: () => void;
	onChange: (addresses: string[]) => void;
	warning?: boolean;
}

export default function AddressList({
	addresses,
	onAdd,
	onChange,
	warning,
}: AddressListProps) {
	return (
		<div className="mt-8 flex items-center gap-[8px] flex-wrap">
			{addresses?.map((user, i) => {
				return (
					<AddressUnit
						address={user}
						key={`${user}:${i}`}
						onRemove={() =>
							onChange([...addresses.filter((u) => u !== user)])
						}
					/>
				);
			})}
			<button
				onClick={onAdd}
				className={clsx(
					"text-sm flex w-fit items-center gap-[10px] h-12",
					warning ? "text-[#E54545]" : "text-[#FFAEEE]",
				)}
			>
				{warning ? <Icons.alertTriangle /> : <Icons.plus />}
				Add approver
			</button>
		</div>
	);
}

import { FlexRender, tableFeatures, useTable, type ColumnDef } from "@tanstack/react-table";
import { useTanStackTableDevtools } from "@tanstack/react-table-devtools";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import type { User } from "../model/user.ts";

const features = tableFeatures({});

const columns: ColumnDef<typeof features, User>[] = [
    {
        accessorKey: "firstName",
        header: "First Name",
        cell: (info) => info.getValue(),
    },
    {
        accessorFn: (row) => row.lastName,
        id: "lastName",
        header: () => <span>Last Name</span>,
        cell: (info) => <i>{info.getValue<string>()}</i>,
    },
    {
        accessorKey: "age",
        header: () => "Age",
    },
];

type UsersTableProps = {
    users: User[];
};

export function UsersTable({ users }: UsersTableProps) {
    const table = useTable({
        key: "users-table",
        features,
        columns,
        data: users,
    });

    // Shows this table in TanStack Devtools; removed from production builds by devtools() in vite.config.ts
    useTanStackTableDevtools(table);

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                                {header.isPlaceholder ? null : <FlexRender header={header} />}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                        {row.getAllCells().map((cell) => (
                            <TableCell key={cell.id}>
                                <FlexRender cell={cell} />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

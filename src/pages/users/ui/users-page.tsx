import { demoUsers } from "../model/demo-users.ts";
import { UsersTable } from "./users-table.tsx";

export function UsersPage() {
    return (
        <main className="mx-auto max-w-2xl pt-24">
            <h1 className="mb-6 text-2xl font-semibold">Users</h1>
            <UsersTable users={demoUsers} />
        </main>
    );
}

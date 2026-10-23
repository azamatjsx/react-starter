// Lives in this page until a second slice needs users; then move it to entities/user
// (FSD: "Excessive entities" — extract an entity once it is shared)
export type User = {
    firstName: string;
    lastName: string;
    age: number;
};

export function H1({ children }: { children: React.ReactNode }) {
    return <h1 className="text-4xl font-bold text-center my-8">{children}</h1>;
}

export function H2({ children }: { children: React.ReactNode }) {
    return <h2 className="text-2xl font-bold my-8">{children}</h2>;
}

export function H3({ children }: { children: React.ReactNode }) {
    return <h3 className="text-xl font-bold my-4">{children}</h3>;
}
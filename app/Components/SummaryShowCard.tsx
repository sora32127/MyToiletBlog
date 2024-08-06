import { H2 } from "./Headings";

export default function SummaryShowCard({postSummary}: {postSummary: string}) {
    return (
        <div className="card card-compact w-96 bg-base-100 shadow-xl">
            <div className="card-body">
                <H2>要約</H2>
               {postSummary}
            </div>
        </div>
    )
}
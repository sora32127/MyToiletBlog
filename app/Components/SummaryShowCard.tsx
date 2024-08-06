import { H2 } from "./Headings";

export default function SummaryShowCard({postSummary}: {postSummary: string}) {
    return (
        <div className="card card-compact w-96 bg-base-100">
            <div className="card-body">
               {postSummary}
            </div>
        </div>
    )
}
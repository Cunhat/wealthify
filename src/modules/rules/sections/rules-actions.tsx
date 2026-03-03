import AnalyseSuggestionsDialog from "../components/analyse-suggestions-dialog";
import CreateRuleDialog from "../components/create-rule-dialog";

export default function RulesActions() {
	return (
		<div className="flex items-center gap-2">
			<AnalyseSuggestionsDialog />
			<CreateRuleDialog />
		</div>
	);
}

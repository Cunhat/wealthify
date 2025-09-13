import dayjs from "dayjs";
import React from "react";

export default function NetWorthWidget() {
	const resultsDate = dayjs().subtract(1, "year").format("YYYY-MM-DD");

	console.log(resultsDate);

	return <div>NetWorthWidget</div>;
}

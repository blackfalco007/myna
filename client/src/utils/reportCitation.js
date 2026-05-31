import dayjs from "dayjs";

const clean = (x = "") =>
  x
    .replace(/[^a-zA-Z0-9]/g, "")
    .trim();

export const generateReportId = ({
  selectedState,
  selectedCounty,
  startDate,
  endDate,
  dataEndDate
}) => {

  const state =
    clean(selectedState).slice(0, 2).toUpperCase();

  const district =
    clean(selectedCounty).slice(0, 8);

  const start =
    dayjs(startDate).format("YYYYMMDD");

  const end =
    dayjs(endDate).format("YYYYMMDD");

  const dataset =
    dayjs(dataEndDate).format("YYYYMMDD");

  return `MYNA-${state}-${district}-${start}_${end}-D${dataset}`;
};

export const generateApaCitation = ({
  selectedState,
  selectedCounty,
  startDate,
  endDate
}) => {

const citationDate =
  dayjs().format("DD MMM YYYY");

  return `State of India’s Birds. (${citationDate}). MYNA report for ${selectedCounty}, ${selectedState} (${dayjs(startDate).format("YYYY")}–${dayjs(endDate).format("YYYY")}). Retrieved from https://myna.stateofindiasbirds.in`;
};

export const generateBibtex = ({
  reportId,
  selectedState,
  selectedCounty,
  startDate,
  endDate,
  dataEndDate
}) => {

  const key =
    reportId
      .replace(/[^a-zA-Z0-9]/g, "_");

  return `@misc{${key},

  author = {{State of India’s Birds}},

  title = {MYNA report for ${selectedCounty}, ${selectedState}},

  year = {${dayjs().format("YYYY")}},

  howpublished = {\\url{https://myna.stateofindiasbirds.in}},

  note = {Analysis period: ${dayjs(startDate).format("YYYY-MM-DD")} to ${dayjs(endDate).format("YYYY-MM-DD")}, Dataset version: ${dataEndDate}, Report ID: ${reportId}}

}`;
};
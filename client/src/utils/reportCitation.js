import dayjs from "dayjs";

const clean = (x = "") =>
  x
    .replace(/[^a-zA-Z0-9]/g, "")
    .trim();

export const getGeographyString = (
  selectedState,
  selectedCounty,
  selectedLocality
) =>
  [selectedLocality, selectedCounty, selectedState]
    .filter(Boolean)
    .join(", ");


export const getGeographyId = (
  selectedCounty,
  selectedLocality
) =>
  [
    clean(selectedCounty).slice(0, 10),
    clean(selectedLocality).slice(0, 10)
  ]
    .filter(Boolean)
    .join("-");


export const generateReportId = ({
  selectedState,
  selectedCounty,
  selectedLocality,
  startDate,
  endDate,
  dataEndDate
}) => {

  const state = clean(selectedState).slice(0, 2).toUpperCase();

  const geography = getGeographyId(
    selectedCounty,
    selectedLocality
  );

  const start =
    dayjs(startDate).format("YYYYMMDD");

  const end =
    dayjs(endDate).format("YYYYMMDD");

  const dataset =
    dayjs(dataEndDate).format("YYYYMMDD");

  return `MYNA-${state}-${geography}-${start}_${end}-D${dataset}`;
};


export const generateApaCitation = ({
  selectedState,
  selectedCounty,
  selectedLocality,
  startDate,
  endDate
}) => {


const citationDate =
  dayjs().format("DD MMM YYYY");

  const geography_citation = getGeographyString(
  selectedState,
  selectedCounty,
  selectedLocality
  );

  return `State of India’s Birds. (${citationDate}). MYNA report for ${geography_citation} (${dayjs(startDate).format("YYYY")}–${dayjs(endDate).format("YYYY")}). Retrieved from https://myna.stateofindiasbirds.in`;
};

export const generateBibtex = ({
  reportId,
  selectedState,
  selectedCounty,
  selectedLocality,
  startDate,
  endDate,
  dataEndDate
}) => {

  const geography_bib = getGeographyString(
    selectedState,
    selectedCounty,
    selectedLocality
  );

  const key =
    reportId
      .replace(/[^a-zA-Z0-9]/g, "_");

  return `@misc{${key},

  author = {{State of India’s Birds}},

  title = {MYNA report for ${geography_bib}},

  year = {${dayjs().format("YYYY")}},

  howpublished = {\\url{https://myna.stateofindiasbirds.in}},

  note = {Analysis period: ${dayjs(startDate).format("YYYY-MM-DD")} to ${dayjs(endDate).format("YYYY-MM-DD")}, Dataset version: ${dataEndDate}, Report ID: ${reportId}}

}`;
};
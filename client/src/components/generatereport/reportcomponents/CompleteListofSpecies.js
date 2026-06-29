import React from "react";

const isMobile = window.innerWidth < 640;

const headerCellStyle = {
  backgroundColor: "#F3EDE8",
  color: "#000",
  fontWeight: 700,
  padding: isMobile ? "8px 10px" : "8px 40px",
  textAlign: "left",
  verticalAlign: "top"
};

const bodyCellStyle = {
  padding: isMobile ? "8px 10px" : "8px 40px",
  verticalAlign: "top",
  borderBottom: "1px solid rgba(224, 224, 224, 1)"
};

const CompleteListOfSpecies = React.memo(({ completeListOfSpecies = [] }) => {
  if (!completeListOfSpecies.length) return null;

  return (
    <>
      <div
        style={{ backgroundColor: "#9A7269", color: "#fff" }}
        className="text-center sm:text-xl md:text-3xl lg:text-3xl gandhi-family p-4"
      >
        COMPLETE LIST OF SPECIES
      </div>
      <div style={{ overflowX: "auto", backgroundColor: "#fff" }}>
        <table
          aria-label="responsive table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed"
          }}
        >
          <thead>
            <tr>
              <th className="gandhi-family-bold" style={headerCellStyle}>Species</th>
              <th className="gandhi-family-bold" style={headerCellStyle}>SoIB Priority</th>
              <th className="gandhi-family-bold" style={headerCellStyle}>IUCN</th>
              <th className="gandhi-family-bold" style={headerCellStyle}>Endemic Region</th>
              <th className="gandhi-family-bold" style={headerCellStyle}>WLPA</th>
            </tr>
          </thead>
          <tbody>
            {completeListOfSpecies.map((data, i) => (
              <tr
                key={`${data.indiaChecklistScientificName || data.indiaChecklistCommonName || "species"}-${i}`}
                style={{ backgroundColor: i % 2 === 0 ? "#C8D8DC" : "#F3EDE8" }}
              >
                <td style={bodyCellStyle}>
                  <span className="gandhi-family">{data.indiaChecklistCommonName}</span>
                  <br />
                  <i>{data.indiaChecklistScientificName}</i>
                </td>
                <td style={bodyCellStyle}><span className="gandhi-family">{data.soibConcernStatus}</span></td>
                <td style={bodyCellStyle}><span className="gandhi-family">{data.iucnCategory}</span></td>
                <td style={bodyCellStyle}><span className="gandhi-family">{data?.endemicRegion}</span></td>
                <td style={bodyCellStyle}><span className="gandhi-family">{data.wpaSchedule}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
});

export default CompleteListOfSpecies;
import withSimulation from "../../hocs/withSimulation";

const NotFoundPage = () => (
  <>
    <div style={{ display: "flex", alignItems: "center", marginTop: "200px", textAlign: "center", width: "100%" }}>
      <h2 style={{ color: "white", textAlign: "center", fontFamily: "sans-serif", margin: "auto" }}>
        This page is not implemented yet.
      </h2>
    </div>
  </>
);

export default withSimulation(NotFoundPage);

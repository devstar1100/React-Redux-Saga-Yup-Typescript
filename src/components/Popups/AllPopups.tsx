import AddButtonPopup from "./AddWidget/AddButtonPopup";
import AddChartPopup from "./AddWidget/AddChartPopup";
import AddGaugePopup from "./AddWidget/AddGaugePopup";
import AddMapPopup from "./AddWidget/AddMapPopup";
import AddTablePopup from "./AddWidget/AddTablePopup";
import ConfirmationPopup from "./ConfirmationPopup";
import ModifyParameterPopup from "./ModifyParameterPopup";

const AllPopups = () => (
  <>
    <ConfirmationPopup />
    <AddTablePopup />
    <AddGaugePopup />
    <AddButtonPopup />
    <AddMapPopup />
    <AddChartPopup />
    <ModifyParameterPopup />
  </>
);

export default AllPopups;

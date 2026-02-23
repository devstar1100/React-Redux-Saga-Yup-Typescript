import { FC, ReactElement, useRef } from "react";
import { styled } from "@mui/material";
import { ViewportList } from "react-viewport-list";
import { useDispatch } from "react-redux";
import { updatePopup } from "../../../redux/actions/popupsActions";
import { Popups } from "../../../types/popups";
import { ModifyParamPopupProps } from "../../../components/Popups/ModifyParameterPopup";
import TreeItem, { TreeItemData } from "./TreeItem";
import TreeView from "@mui/lab/TreeView";
import SearchIcon from "../../../components/Icons/SearchIcon";
import IconMinus from "../../../components/Icons/IconMinus";
import IconPlus from "../../../components/Icons/IconPlus";
import Container from "../../../components/WidgetContainer";
import Textfield from "../../../components/Textfield";

interface IDataBrowser {
  data: any;
  sessionId: number;
  expandedNodes: string[];
  disableOverlay?: boolean;
  hideHeaderActionElements?: boolean;
  paramEditOnDlClick: boolean;
  handleSearchChange: (event: any) => void;
  handleNodeToggle: (event: any, nodeIds: string[]) => void;
  handleNodeSelect?: (event: any, nodeId: string) => void;
}

const DataTreeView: FC<IDataBrowser> = ({
  data,
  sessionId,
  expandedNodes,
  disableOverlay = false,
  hideHeaderActionElements = false,
  paramEditOnDlClick,
  handleSearchChange,
  handleNodeToggle,
  handleNodeSelect,
}): ReactElement => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement | null>(null);

  const handleDoubleClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, data: TreeItemData) => {
    if (data.children?.length || data.nonEditable) {
      event.preventDefault();
      return;
    }

    dispatch(
      updatePopup({
        popup: Popups.modifyParameter,
        status: true,
        prefilled: { "simulation-session-id": sessionId, "parameter-path": data.id } as ModifyParamPopupProps,
      }),
    );
  };

  return (
    <Container
      title="Simulator Data Browser"
      disableOverlay={disableOverlay}
      headingAction={
        !hideHeaderActionElements ? (
          <Textfield
            placeholder="Search"
            color="secondary"
            startAdornment={<SearchIcon />}
            onChange={handleSearchChange}
          />
        ) : undefined
      }
    >
      <>
        <Tree
          ref={ref}
          aria-label="customized"
          defaultCollapseIcon={<IconMinus />}
          defaultExpandIcon={<IconPlus />}
          expanded={expandedNodes}
          onNodeToggle={handleNodeToggle}
          onNodeSelect={handleNodeSelect}
        >
          <ViewportList viewportRef={ref} items={data}>
            {(item: TreeItemData) => (
              <TreeItem
                {...item}
                key={item.title}
                hideEditButton={paramEditOnDlClick}
                onDoubleClick={handleDoubleClick}
              />
            )}
          </ViewportList>
        </Tree>
      </>
    </Container>
  );
};

const Tree = styled(TreeView)({
  marginTop: "16px",
  height: "100%",
  minHeight: "500px",
  overflowY: "auto",
  overflowX: "hidden",
});

export default DataTreeView;

import { FC, ReactElement, useRef } from "react";
import TreeView from "@mui/lab/TreeView";
import { styled } from "@mui/material/styles";
import { ViewportList } from "react-viewport-list";

import IconMinus from "../../../components/Icons/IconMinus";
import IconPlus from "../../../components/Icons/IconPlus";
import Container from "../../../components/WidgetContainer/WidgetContainer";
import TreeItem, { TreeItemData } from "./TreeItem";
import Textfield from "../../../components/Textfield/Textfield";
import SearchIcon from "../../../components/Icons/SearchIcon";
import { useDispatch } from "react-redux";
import { updatePopup } from "../../../redux/actions/popupsActions";
import { Popups } from "../../../types/popups";
import { ModifyParamPopupProps } from "../../../components/Popups/ModifyParameterPopup";

interface IDataBrowser {
  data: any;
  sessionId: number;
  expandedNodes: string[];
  // hasMoreSystems?: boolean;
  disableOverlay?: boolean;
  hideHeaderActionElements?: boolean;
  paramEditOnDlClick: boolean;
  handleSearchChange: (event: any) => void;
  handleNodeToggle: (event: any, nodeIds: string[]) => void;
  handleNodeSelect?: (event: any, nodeId: string) => void;
  // handleLoadMoreSystems: () => void;
}

const DataTreeView: FC<IDataBrowser> = ({
  data,
  sessionId,
  expandedNodes,
  // hasMoreSystems = false,
  disableOverlay = false,
  hideHeaderActionElements = false,
  paramEditOnDlClick,
  handleSearchChange,
  handleNodeToggle,
  handleNodeSelect,
  // handleLoadMoreSystems,
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
        {/* {expandedNodes.includes("systems-data") && hasMoreSystems && (
          <Typography
            component="div"
            width="fit-content"
            variant={"body2"}
            color={"textColor.main"}
            fontWeight={400}
            paddingLeft="32px"
            marginTop="10px"
            sx={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={handleLoadMoreSystems}
          >
            Load more systems...
          </Typography>
        )} */}
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

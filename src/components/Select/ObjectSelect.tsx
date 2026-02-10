// import * as React from "react";
// import MenuItem from "@mui/material/MenuItem";
// import FormControl from "@mui/material/FormControl";
// import MUISelect from "@mui/material/Select";
// import { Grid, SelectChangeEvent, Typography, useTheme } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import { CollapseArrowUp } from "../Icons/CollapseArrowUp";
// import { CollapseArrowDown } from "../Icons/CollapseArrowDown";
// import { FC, ReactElement, useState } from "react";

// interface IObjectSelect {
//   options: { "simulation-name": string; "simulation-id": number }[];
//   value: number;
//   placeholder?: string;
//   disabled?: boolean;
//   error?: boolean;
//   onChange: (newValue: number) => void;
// }

// const ObjectSelect: FC<IObjectSelect> = ({ options, value, placeholder, disabled, onChange, error }): ReactElement => {
//   const theme = useTheme();
//   const [open, setOpen] = useState(false);

//   const handleChange = (event: SelectChangeEvent) => {
//     onChange(Number(event.target.value));
//   };

//   const handleClick = () => {
//     setOpen(!open);
//   };

//   return (
//     <Form className={`customSelect ${error && "error"}`}>
//       <MUISelect
//         IconComponent={() => <Grid className="arrowIcon">{open ? <CollapseArrowUp /> : <CollapseArrowDown />}</Grid>}
//         id="select"
//         open={open}
//         onClose={handleClick}
//         onOpen={handleClick}
//         value={String(value)}
//         disabled={disabled}
//         displayEmpty
//         renderValue={(value) =>
//           value !== undefined ? (
//             <Typography variant="subtitle1" color="textColor.lightWhite" pr="11px">
//               {options.find((item) => item["simulation-id"] === Number(value))?.["simulation-name"]}
//             </Typography>
//           ) : (
//             <Typography variant="subtitle1" color="textColor.lightWhite" pr="11px">
//               {placeholder}
//             </Typography>
//           )
//         }
//         inputProps={{ "aria-label": "Without label" }}
//         onChange={handleChange}
//         MenuProps={{
//           PaperProps: {
//             style: {
//               backgroundColor: theme.palette.additional[700],
//               // maxWidth: "220px",
//               // minWidth: "200px",
//               borderRadius: "10px",
//               padding: "2px 10px 10px",
//               marginTop: "10px",
//               maxHeight: "200px",
//             },
//           },
//         }}
//       >
//         {options.map((item) =>
//           item === undefined ? (
//             <Item value={""} key={item}>
//               <Typography variant="subtitle1">{item}</Typography>
//             </Item>
//           ) : (
//             <Item value={item["simulation-id"]} key={item["simulation-id"]}>
//               <Typography variant="subtitle1">{item["simulation-name"]}</Typography>
//             </Item>
//           ),
//         )}
//       </MUISelect>
//     </Form>
//   );
// };

// const Item = styled(MenuItem)(({ theme }) => ({
//   color: theme.palette.textColor.lightWhite,
//   border: "1px solid transparent !important",
//   marginTop: "4px",
//   "&.Mui-selected": {
//     backgroundColor: `${theme.palette.additional[600]} !important`,
//     borderRadius: `${theme.borderRadius.xs} !important`,
//   },
//   "&:hover": {
//     border: `1px solid ${theme.palette.additional[600]} !important`,
//     borderRadius: `${theme.borderRadius.xs} !important`,
//   },
// }));

// const Form = styled(FormControl)(({ theme }) => ({
//   maxWidth: "220px",
//   minWidth: "200px",
//   position: "relative",
//   borderRadius: theme.borderRadius.xs,
//   backgroundColor: theme.palette.additional[700],
//   zIndex: 0,

//   "& .MuiSelect-select": {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "9px 12px",
//     color: theme.palette.textColor.lightWhite,
//     borderRadius: theme.borderRadius.xs,

//     "&.Mui-disabled": {
//       "-webkit-text-fill-color": theme.palette.main[100],
//     },
//   },
//   "& .MuiOutlinedInput-notchedOutline": {
//     border: `1px solid ${theme.palette.additional[700]} !important`,
//   },
//   "& .MuiFormLabel-root": {
//     top: "-4px",
//     color: theme.palette.textColor.lightWhite,
//     [theme.breakpoints.down("xl")]: {
//       top: "-6px",
//     },
//     [theme.breakpoints.down("md")]: {
//       top: "-8px",
//     },
//   },
//   "& .MuiFormLabel-root.Mui-focused": {
//     top: "3px",
//     [theme.breakpoints.down("xl")]: {
//       top: "2px",
//     },
//   },
//   "& .arrowIcon": {
//     display: "flex",
//     right: "10px",
//     position: "absolute",
//     alignItems: "center",
//     zIndex: "-1",
//   },

//   "&.error .MuiOutlinedInput-notchedOutline": {
//     border: `1px solid ${theme.palette.error.main}`,
//   },

//   "&.error .arrowIcon path": {
//     stroke: theme.palette.error.main,
//   },
// }));

// export default ObjectSelect;

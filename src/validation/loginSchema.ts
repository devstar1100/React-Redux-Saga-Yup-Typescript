import * as Yup from "yup";

export const logInSchema = Yup.object().shape({
  username: Yup.string().required("Please, enter username"),
  password: Yup.string().required("Please, enter your password").min(8, "Must contains more than 8 symbols"),
});

export const logInValues = {
  username: "",
  password: "",
};

export interface LogInTypes {
  username: string;
  password: string;
}

type PreventForwardProps = (props: string[]) => {
  shouldForwardProp: (prop: string) => boolean;
};

export const preventForwardProps: PreventForwardProps = (props = []) => ({
  shouldForwardProp: (prop) => !props.includes(prop),
});

import React from "react";

interface Props {
  title?: string;
}

const Seo = ({ title = "Space" }: Props) => (
  <div>
    {/* <title>{title}</title> */}
    {/* <meta property="og:title" content={title} /> */}
    {/*<link rel="shortcut icon" href="/images/favicon.png" type="image/png" />*/}
  </div>
);

export default Seo;

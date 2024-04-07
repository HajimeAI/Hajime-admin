import { removeToken, setToken, type DataInfo } from "./auth";
import { subBefore, getQueryMap } from "@pureadmin/utils";

/**
 * Simplified version of front-end single sign-on, according to the actual business self-written, after the platform is launched, you can jump the back link for test http://localhost:8848/#/permission/page/index?username=sso&roles=admin&accessToken=eyJhbGciOiJIUzUxMiJ9.admin
 * Highlights:
 * Determine whether it is single sign-on, if not, it will be returned directly and no longer carry out any logical processing, the following is the logical processing after single sign-on
 * 1.Clear old local information;
 * 2.Get the important parameter information in the url, and then save it locally through setToken;
 * 3.Remove parameters that do not need to be displayed in the URL
 * 4.Use window.location.replace to jump to the correct page
 */
(function () {
  const params = getQueryMap(location.href) as DataInfo<Date>;
  const must = ["username", "roles", "accessToken"];
  const mustLength = must.length;
  if (Object.keys(params).length !== mustLength) return;

  let sso = [];
  let start = 0;

  while (start < mustLength) {
    if (Object.keys(params).includes(must[start]) && sso.length <= mustLength) {
      sso.push(must[start]);
    } else {
      sso = [];
    }
    start++;
  }

  if (sso.length === mustLength) {

    removeToken();

    setToken(params);

    delete params.roles;
    delete params.accessToken;

    const newUrl = `${location.origin}${location.pathname}${subBefore(
      location.hash,
      "?"
    )}?${JSON.stringify(params)
      .replace(/["{}]/g, "")
      .replace(/:/g, "=")
      .replace(/,/g, "&")}`;

    window.location.replace(newUrl);
  } else {
    return;
  }
})();

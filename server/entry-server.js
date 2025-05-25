import { jsxs, jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { Link, Routes, Route, StaticRouter } from "react-router";
function Navigation() {
  return /* @__PURE__ */ jsxs("nav", { style: { padding: "1rem", borderBottom: "1px solid #ccc" }, children: [
    /* @__PURE__ */ jsx(Link, { to: "/", style: { marginRight: "1rem" }, children: "Home" }),
    /* @__PURE__ */ jsx(Link, { to: "/about", style: { marginRight: "1rem" }, children: "About" }),
    /* @__PURE__ */ jsx(Link, { to: "/projects", style: { marginRight: "1rem" }, children: "Projects" }),
    /* @__PURE__ */ jsx(Link, { to: "/contact", style: { marginRight: "1rem" }, children: "Contact" })
  ] });
}
function Home() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "Mark Wylde" }),
    /* @__PURE__ */ jsx("p", { children: "Welcome to my personal web development site" }),
    /* @__PURE__ */ jsx("p", { children: "I'm a passionate web developer focused on building modern, efficient applications." })
  ] });
}
function About() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "About Me" }),
    /* @__PURE__ */ jsx("p", { children: "I'm a web developer with expertise in modern JavaScript frameworks and technologies." }),
    /* @__PURE__ */ jsx("p", { children: "I love building clean, efficient, and user-friendly applications." })
  ] });
}
function Projects() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "My Projects" }),
    /* @__PURE__ */ jsx("p", { children: "Here are some of the projects I've worked on:" }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { children: "Project 1" }),
      /* @__PURE__ */ jsx("p", { children: "Description of your first project" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h3", { children: "Project 2" }),
      /* @__PURE__ */ jsx("p", { children: "Description of your second project" })
    ] })
  ] });
}
function Contact() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "Contact Me" }),
    /* @__PURE__ */ jsx("p", { children: "Feel free to reach out to me for any inquiries or collaborations." }),
    /* @__PURE__ */ jsx("p", { children: "Email: your-email@example.com" }),
    /* @__PURE__ */ jsx("p", { children: "LinkedIn: Your LinkedIn Profile" }),
    /* @__PURE__ */ jsx("p", { children: "GitHub: Your GitHub Profile" })
  ] });
}
function App() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Navigation, {}),
    /* @__PURE__ */ jsx("main", { style: { padding: "2rem" }, children: /* @__PURE__ */ jsxs(Routes, { children: [
      /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(Home, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/about", element: /* @__PURE__ */ jsx(About, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/projects", element: /* @__PURE__ */ jsx(Projects, {}) }),
      /* @__PURE__ */ jsx(Route, { path: "/contact", element: /* @__PURE__ */ jsx(Contact, {}) })
    ] }) })
  ] });
}
function render(url) {
  const html = renderToString(
    /* @__PURE__ */ jsx(StrictMode, { children: /* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(App, {}) }) })
  );
  return { html };
}
export {
  render
};

import { d as define } from "./worker-entry-CPBxE0QZ.mjs";
const handler$1 = define.handlers({
  GET(ctx) {
    const name = ctx.params.name;
    return new Response(`Hello, ${name.charAt(0).toUpperCase() + name.slice(1)}!`);
  }
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___api_name_ = void 0;
export {
  config,
  css,
  _freshRoute___api_name_ as default,
  handler,
  handlers
};
//# sourceMappingURL=_fresh-route___api_name_-CGq2LBhg-BdZR9gQ5.mjs.map

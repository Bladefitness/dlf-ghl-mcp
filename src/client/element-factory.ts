/**
 * GHL Page Builder Element Factory
 *
 * Pure functions that produce valid GHL page builder element JSON.
 * All node structures match the real autosave-payload.json format captured from the
 * live GHL page builder. Style values use the new object format { value, unit }.
 *
 * Do NOT mutate the return values — treat them as immutable data.
 */

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/**
 * Generate a node ID that matches the GHL builder convention.
 * The builder uses `{prefix}-{randomAlphanumeric10}` for new nodes.
 * We replicate that with a UUID-derived slug.
 *
 * Uses the globally-available Web Crypto `crypto.randomUUID()` which is
 * present in Cloudflare Workers, browsers, and Node >= 19.
 */
export function generateId(prefix?: string): string {
  const slug = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  return prefix ? `${prefix}-${slug}` : slug;
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

type PxValue = { value: number | string; unit: "px" };
type PctValue = { value: number | string; unit: "%" };
type CssVarValue = { value: string };
type UnitlessValue = { value: string | number; unit: "" };

function px(v: number | string): PxValue {
  return { value: v, unit: "px" };
}

function pct(v: number | string): PctValue {
  return { value: v, unit: "%" };
}

function cssVar(v: string): CssVarValue {
  return { value: v };
}

// ---------------------------------------------------------------------------
// Shared default style blocks — derived from real payload
// ---------------------------------------------------------------------------

function defaultSectionStyles() {
  return {
    boxShadow: cssVar("none"),
    paddingLeft: px(0),
    paddingRight: px(0),
    paddingBottom: px(20),
    paddingTop: px(20),
    marginTop: px(0),
    marginBottom: px(0),
    marginLeft: px(0),
    marginRight: px(0),
    backgroundColor: cssVar("var(--transparent)"),
    background: cssVar("none"),
    backdropFilter: cssVar("none"),
    borderColor: cssVar("var(--black)"),
    borderWidth: { value: "2", unit: "px" } as PxValue,
    borderStyle: cssVar("solid"),
  };
}

function defaultRowStyles() {
  return {
    boxShadow: cssVar("none"),
    paddingLeft: px(5),
    paddingRight: px(5),
    paddingTop: px(10),
    paddingBottom: px(10),
    backgroundColor: cssVar("var(--transparent)"),
    background: cssVar("none"),
    backdropFilter: cssVar("none"),
    borderColor: cssVar("var(--black)"),
    borderWidth: { value: "2", unit: "px" } as PxValue,
    borderStyle: cssVar("solid"),
  };
}

function defaultColStyles(widthPct = 100) {
  return {
    boxShadow: cssVar("none"),
    paddingLeft: px(5),
    paddingRight: px(5),
    paddingTop: px(10),
    paddingBottom: px(10),
    backgroundColor: cssVar("var(--transparent)"),
    background: cssVar("none"),
    backdropFilter: cssVar("none"),
    width: pct(widthPct),
    borderColor: cssVar("var(--black)"),
    borderWidth: { value: "2", unit: "px" } as PxValue,
    borderStyle: cssVar("solid"),
  };
}

function defaultBgImage() {
  return {
    value: {
      mediaType: "image",
      url: "",
      opacity: "1",
      options: "bgCover",
      svgCode: "",
      videoUrl: "",
      videoThumbnail: "",
      videoLoop: true,
    },
  };
}

function defaultVisibility() {
  return { value: { hideDesktop: false, hideMobile: false } };
}

// ---------------------------------------------------------------------------
// Universal node interface
// ---------------------------------------------------------------------------

export interface StyleObject {
  [key: string]: unknown;
}

export interface BaseNode {
  id: string;
  type: "section" | "row" | "col" | "element";
  meta: string;
  tagName: string;
  title: string;
  child: string[];
  styles: StyleObject;
  mobileStyles: StyleObject;
  wrapper: StyleObject;
  mobileWrapper: StyleObject;
  class: StyleObject;
  extra: StyleObject;
  customCss: unknown[];
  /** Present on col nodes from real payload */
  noOfColumns?: number;
  /** Present on social-icons */
  version?: number;
  /** Present on faq */
  tag?: string;
}

// ---------------------------------------------------------------------------
// Section wrapper interface
// ---------------------------------------------------------------------------

export interface SectionData {
  id: string;
  metaData: BaseNode;
  elements: BaseNode[];
  sequence: number;
  pageId: string;
  funnelId: string;
  locationId: string;
  general: {
    colors: Array<{ label: string; value: string }>;
    fontsForPreview: unknown[];
    rootVars: Record<string, string>;
    sectionStyles: string;
    customFonts: unknown[];
  };
}

// ---------------------------------------------------------------------------
// Layout builders
// ---------------------------------------------------------------------------

export interface SectionOptions {
  background?: string;
  paddingTop?: number;
  paddingBottom?: number;
  gradient?: string;
  visibility?: { hideDesktop: boolean; hideMobile: boolean };
}

export function createSection(opts: SectionOptions = {}): BaseNode {
  const id = generateId("section");
  const styles = {
    ...defaultSectionStyles(),
    ...(opts.paddingTop !== undefined ? { paddingTop: px(opts.paddingTop) } : {}),
    ...(opts.paddingBottom !== undefined ? { paddingBottom: px(opts.paddingBottom) } : {}),
    ...(opts.background ? { background: cssVar(opts.background) } : {}),
    ...(opts.gradient ? { background: cssVar(opts.gradient) } : {}),
  };

  return {
    id,
    type: "section",
    meta: "section",
    tagName: "c-section",
    title: "Section",
    child: [],
    styles,
    mobileStyles: {},
    wrapper: {},
    mobileWrapper: {},
    class: {
      width: { value: "fullSection" },
      borders: { value: "noBorder" },
      borderRadius: { value: "radius0" },
      radiusEdge: { value: "none" },
    },
    extra: {
      sticky: { value: "noneSticky" },
      visibility: opts.visibility
        ? { value: opts.visibility }
        : defaultVisibility(),
      bgImage: defaultBgImage(),
      allowRowMaxWidth: { value: false },
      customClass: { value: [] },
      elementScreenshot: { value: [] },
    },
    customCss: [],
  };
}

export interface RowOptions {
  columns?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

export function createRow(opts: RowOptions = {}): { row: BaseNode; columns: BaseNode[] } {
  const columnCount = opts.columns ?? 1;
  const colWidthPct = Math.floor(100 / columnCount);
  const columns = Array.from({ length: columnCount }, (_, i) =>
    createColumn({ width: i === columnCount - 1 ? 100 - colWidthPct * (columnCount - 1) : colWidthPct, index: i, total: columnCount })
  );

  const rowId = generateId("row");

  const row: BaseNode = {
    id: rowId,
    type: "row",
    meta: "row",
    tagName: "c-row",
    title: `${columnCount} Column Row`,
    child: columns.map((c) => c.id),
    styles: {
      ...defaultRowStyles(),
      ...(opts.paddingTop !== undefined ? { paddingTop: px(opts.paddingTop) } : {}),
      ...(opts.paddingBottom !== undefined ? { paddingBottom: px(opts.paddingBottom) } : {}),
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px(0),
      marginBottom: px(0),
      marginLeft: { value: "auto", unit: "" } as UnitlessValue,
      marginRight: { value: "auto", unit: "" } as UnitlessValue,
    },
    mobileWrapper: {},
    class: {
      alignRow: { value: "row-align-center" },
      borders: { value: "noBorder" },
      borderRadius: { value: "radius0" },
      radiusEdge: { value: "none" },
    },
    extra: {
      visibility: defaultVisibility(),
      bgImage: defaultBgImage(),
      rowWidth: pct(100),
      customClass: { value: [] },
    },
    customCss: [],
  };

  return { row, columns };
}

export interface ColumnOptions {
  width?: number;
  index?: number;
  total?: number;
}

export function createColumn(opts: ColumnOptions = {}): BaseNode {
  const colId = generateId("col");
  const widthPct = opts.width ?? 100;
  const total = opts.total ?? 1;
  const index = opts.index ?? 0;

  const ordinals = ["1st", "2nd", "3rd", "4th", "5th"];
  const label = total === 1 ? "Column" : `${ordinals[index] ?? `${index + 1}th`} Column`;

  return {
    id: colId,
    type: "col",
    meta: "col",
    tagName: "c-column",
    title: label,
    child: [],
    styles: defaultColStyles(widthPct),
    mobileStyles: {},
    wrapper: {
      marginLeft: px(0),
      marginRight: px(0),
      marginTop: px(0),
      marginBottom: px(0),
    },
    mobileWrapper: {},
    class: {
      borders: { value: "noBorder" },
      borderRadius: { value: "radius0" },
      radiusEdge: { value: "none" },
      nestedColumn: { value: "" },
    },
    extra: {
      visibility: defaultVisibility(),
      bgImage: defaultBgImage(),
      columnLayout: { value: "column" },
      justifyContentColumnLayout: { value: "center" },
      alignContentColumnLayout: { value: "inherit" },
      forceColumnLayoutForMobile: { value: true },
      customClass: { value: [] },
      elementVersion: { value: 2 },
    },
    customCss: [],
    noOfColumns: total,
  };
}

// ---------------------------------------------------------------------------
// Content element builders
// ---------------------------------------------------------------------------

export interface HeadingOptions {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  fontSize?: number;
  mobileFontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  textAlign?: string;
}

export function createHeading(text: string, opts: HeadingOptions = {}): BaseNode {
  const level = opts.level ?? 1;
  const tag = `h${level}`;
  const deskFontSize = opts.fontSize ?? 40;
  const mobFontSize = opts.mobileFontSize ?? 30;
  const id = generateId("heading");

  return {
    id,
    type: "element",
    meta: "heading",
    tagName: "c-heading",
    title: "Headline",
    tag,
    child: [],
    styles: {
      backgroundColor: cssVar("var(--transparent)"),
      color: opts.color ? cssVar(opts.color) : cssVar("var(--text-color)"),
      boldTextColor: cssVar("var(--text-color)"),
      italicTextColor: cssVar("var(--text-color)"),
      underlineTextColor: cssVar("var(--text-color)"),
      linkTextColor: cssVar("var(--link-color)"),
      iconColor: cssVar("var(--text-color)"),
      fontFamily: cssVar(opts.fontFamily ?? ""),
      fontWeight: cssVar(opts.fontWeight ?? "normal"),
      paddingLeft: px("0"),
      paddingRight: px("0"),
      paddingTop: px("0"),
      paddingBottom: px(0),
      opacity: cssVar("1"),
      textShadow: cssVar("0px 0px 0px rgba(0,0,0,0)"),
      borderColor: cssVar("var(--black)"),
      borderWidth: { value: "2", unit: "px" },
      borderStyle: cssVar("solid"),
      lineHeight: { value: 1.3, unit: "em" },
      textTransform: cssVar("none"),
      letterSpacing: { value: "0", unit: "px" },
      textAlign: cssVar(opts.textAlign ?? "left"),
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px(""),
      marginBottom: px("0"),
    },
    mobileWrapper: {},
    class: {
      boxShadow: { value: "none" },
      borders: { value: "noBorder" },
      borderRadius: { value: "radius0" },
      radiusEdge: { value: "none" },
    },
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      text: { value: `<${tag}>${text}</${tag}>` },
      mobileFontSize: { value: String(mobFontSize), unit: "px" },
      desktopFontSize: { value: String(deskFontSize), unit: "px" },
      typography: { value: "var(--headlinefont)" },
      icon: { value: { name: "", unicode: "", fontFamily: "" } },
      customClass: { value: [] },
    },
    customCss: [],
  };
}

export interface SubHeadingOptions {
  fontSize?: number;
  mobileFontSize?: number;
  color?: string;
  textAlign?: string;
}

export function createSubHeading(text: string, opts: SubHeadingOptions = {}): BaseNode {
  const deskFontSize = opts.fontSize ?? 18;
  const mobFontSize = opts.mobileFontSize ?? 16;
  const id = generateId("sub-heading");

  return {
    id,
    type: "element",
    meta: "sub-heading",
    tagName: "c-sub-heading",
    title: "Sub Headline",
    tag: "h3",
    child: [],
    styles: {
      backgroundColor: cssVar("var(--transparent)"),
      color: opts.color ? cssVar(opts.color) : cssVar("var(--black)"),
      boldTextColor: cssVar("var(--text-color)"),
      italicTextColor: cssVar("var(--text-color)"),
      underlineTextColor: cssVar("var(--text-color)"),
      linkTextColor: cssVar("var(--link-color)"),
      iconColor: cssVar("var(--text-color)"),
      fontFamily: cssVar(""),
      fontWeight: cssVar("normal"),
      paddingLeft: px(0),
      paddingRight: px(0),
      paddingTop: px(0),
      paddingBottom: px(0),
      opacity: cssVar("1"),
      textShadow: cssVar("0px 0px 0px rgba(0,0,0,0)"),
      borderColor: cssVar("var(--black)"),
      borderWidth: { value: "2", unit: "px" },
      borderStyle: cssVar("solid"),
      lineHeight: { value: 1.3, unit: "em" },
      textTransform: cssVar(""),
      letterSpacing: { value: "0", unit: "px" },
      textAlign: cssVar(opts.textAlign ?? "center"),
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px("10"),
      marginBottom: px(0),
    },
    mobileWrapper: {},
    class: {
      boxShadow: { value: "none" },
      borders: { value: "noBorder" },
      borderRadius: { value: "radius0" },
      radiusEdge: { value: "none" },
    },
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      text: { value: `<h2>${text}</h2>` },
      mobileFontSize: { value: String(mobFontSize), unit: "px" },
      desktopFontSize: { value: String(deskFontSize), unit: "px" },
      typography: { value: "var(--headlinefont)" },
      icon: { value: { name: "", unicode: "", fontFamily: "" } },
      customClass: { value: [] },
    },
    customCss: [],
  };
}

export interface ParagraphOptions {
  fontSize?: number;
  mobileFontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: string;
}

export function createParagraph(text: string, opts: ParagraphOptions = {}): BaseNode {
  const deskFontSize = opts.fontSize ?? 20;
  const mobFontSize = opts.mobileFontSize ?? 20;
  const id = generateId("paragraph");

  return {
    id,
    type: "element",
    meta: "paragraph",
    tagName: "c-paragraph",
    title: "Paragraph",
    tag: "p",
    child: [],
    styles: {
      backgroundColor: cssVar("var(--transparent)"),
      color: opts.color ? cssVar(opts.color) : cssVar("var(--text-color)"),
      boldTextColor: cssVar("var(--text-color)"),
      italicTextColor: cssVar("var(--text-color)"),
      underlineTextColor: cssVar("var(--text-color)"),
      linkTextColor: cssVar("var(--link-color)"),
      iconColor: cssVar("var(--text-color)"),
      fontFamily: cssVar(opts.fontFamily ?? ""),
      fontWeight: cssVar("normal"),
      paddingLeft: px(10),
      paddingRight: px(10),
      paddingTop: px(30),
      paddingBottom: px(0),
      opacity: cssVar("1"),
      textShadow: cssVar("0px 0px 0px rgba(0,0,0,0)"),
      borderColor: cssVar("var(--black)"),
      borderWidth: { value: "2", unit: "px" },
      borderStyle: cssVar("solid"),
      lineHeight: { value: 1.5, unit: "em" },
      textTransform: cssVar("none"),
      letterSpacing: { value: "0", unit: "px" },
      textAlign: cssVar(opts.textAlign ?? "left"),
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px(0),
      marginBottom: px(0),
    },
    mobileWrapper: {},
    class: {
      boxShadow: { value: "none" },
      borders: { value: "noBorder" },
      borderRadius: { value: "radius0" },
      radiusEdge: { value: "none" },
    },
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      text: { value: `<p>${text}</p>` },
      mobileFontSize: { value: mobFontSize, unit: "px" },
      desktopFontSize: { value: deskFontSize, unit: "px" },
      typography: { value: "var(--contentfont)" },
      icon: { value: { name: "", unicode: "", fontFamily: "" } },
      customClass: { value: [] },
    },
    customCss: [],
  };
}

export interface ButtonOptions {
  url?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  mobileFontSize?: number;
  borderRadius?: string;
  textAlign?: string;
  width?: string;
}

export function createButton(text: string, opts: ButtonOptions = {}): BaseNode {
  const deskFontSize = opts.fontSize ?? 17;
  const mobFontSize = opts.mobileFontSize ?? 15;
  const id = generateId("button");
  const hasUrl = !!(opts.url);

  return {
    id,
    type: "element",
    meta: "button",
    tagName: "c-button",
    title: "Button",
    tag: "",
    child: [],
    styles: {
      backgroundColor: cssVar(opts.backgroundColor ?? "var(--white)"),
      color: cssVar(opts.color ?? "var(--black)"),
      secondaryColor: cssVar("var(--white)"),
      textDecoration: cssVar("none"),
      paddingTop: px("10"),
      paddingBottom: px("10"),
      paddingLeft: px("30"),
      paddingRight: px("30"),
      fontWeight: cssVar("bold"),
      borderColor: cssVar("var(--transparent)"),
      borderWidth: { value: "1", unit: "px" },
      borderStyle: cssVar("solid"),
      letterSpacing: { value: "0", unit: "px" },
      textTransform: cssVar("capitalize"),
      textShadow: cssVar("0px 0px 0px rgba(0,0,0,0)"),
      width: { value: opts.width ?? "100", unit: "%" },
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px("15"),
      marginBottom: px(0),
      textAlign: cssVar(opts.textAlign ?? "center"),
    },
    mobileWrapper: {},
    class: {
      buttonEffects: { value: "none" },
      buttonBoxShadow: { value: "btnshadow" },
      buttonBgStyle: { value: "custom" },
      buttonVp: { value: "btn-vp" },
      buttonHp: { value: "btn-hp" },
      borders: { value: "borderFull" },
      borderRadius: { value: opts.borderRadius ?? "radius10" },
      radiusEdge: { value: "none" },
    },
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      text: { value: text },
      subText: { value: "" },
      mobileFontSize: { value: String(mobFontSize), unit: "px" },
      desktopFontSize: { value: String(deskFontSize), unit: "px" },
      subTextDesktopFontSize: { value: 15, unit: "px" },
      subTextMobileFontSize: { value: 15, unit: "px" },
      typography: { value: "var(--contentfont)" },
      iconStart: { value: { name: "", unicode: "", fontFamily: "" } },
      iconEnd: { value: { name: "", unicode: "", fontFamily: "" } },
      action: { value: hasUrl ? "url" : "go-to-funnel-step" },
      visitWebsite: { value: { url: opts.url ?? "", newTab: false } },
      hideElements: { value: [] },
      scrollToElement: { value: "" },
      phoneNumber: { value: "" },
      emailAddress: { value: "" },
      productId: { value: "" },
      stepPath: { value: "" },
      saleAction: { value: "go-to-next-funnel-step" },
      theme: { value: "none" },
      customClass: { value: [] },
      showElements: { value: [] },
      popupId: { value: "" },
    },
    customCss: [],
  };
}

export interface ImageOptions {
  alt?: string;
  width?: number | string;
  height?: number | string;
}

export function createImage(src: string, opts: ImageOptions = {}): BaseNode {
  const id = generateId("image");

  return {
    id,
    type: "element",
    meta: "image",
    tagName: "c-image",
    title: "Image",
    tag: "",
    child: [],
    styles: {
      paddingLeft: px(0),
      paddingRight: px(0),
      paddingTop: px(0),
      paddingBottom: px(0),
      backgroundColor: cssVar("var(--transparent)"),
      opacity: cssVar("1"),
      textAlign: cssVar("center"),
      boxShadow: cssVar("none"),
      width: { value: opts.width ?? 170, unit: "px" },
      height: { value: opts.height ?? "auto", unit: "" },
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px(0),
      marginBottom: px(0),
      marginLeft: px(0),
      marginRight: px(0),
      width: { value: opts.width ?? 170, unit: "px" },
      height: { value: opts.height ?? "auto", unit: "" },
    },
    mobileWrapper: {},
    class: {
      imageRadius: { value: "radius0" },
      imageBorder: { value: "noBorder" },
      imageEffects: { value: "none" },
    },
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      imageActions: { value: "none" },
      visitWebsite: { value: { url: "", newTab: false } },
      downloadFile: { value: { fileUrl: "", fileName: "" } },
      imageProperties: {
        value: {
          url: src,
          altText: opts.alt ?? "",
          compression: true,
          placeholderBase64: "",
          servingUrl: "",
          imageMeta: "",
        },
      },
      customClass: { value: [] },
      hideElements: { value: [] },
      showElements: { value: [] },
      scrollToElement: { value: "" },
      phoneNumber: { value: "" },
      emailAddress: { value: "" },
      stepPath: { value: "" },
      popupId: { value: "" },
      elementVersion: { value: 2 },
    },
    customCss: [],
  };
}

export interface DividerOptions {
  color?: string;
  thickness?: string;
  width?: string;
  paddingTop?: number;
  paddingBottom?: number;
}

export function createDivider(opts: DividerOptions = {}): BaseNode {
  const id = generateId("divider");

  return {
    id,
    type: "element",
    meta: "divider",
    tagName: "c-divider",
    title: "Divider",
    tag: "",
    child: [],
    styles: {
      paddingTop: px(opts.paddingTop ?? "10"),
      paddingBottom: px(opts.paddingBottom ?? 5),
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px(0),
      marginBottom: px(0),
      paddingTop: px(10),
      paddingBottom: px(10),
    },
    mobileWrapper: {},
    class: {},
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      dividerProperties: {
        value: {
          width: opts.width ?? "100%",
          height: opts.thickness ?? "1px",
          borderStyle: "solid",
          align: "center",
          color: opts.color ?? "var(--transparent)",
        },
      },
      customClass: { value: [] },
    },
    customCss: [],
  };
}

export function createForm(formId: string): BaseNode {
  const id = generateId("form");

  return {
    id,
    type: "element",
    meta: "form",
    tagName: "c-form",
    title: "Form",
    tag: "",
    child: [],
    styles: {
      paddingTop: px(0),
      paddingBottom: px(0),
      paddingLeft: px(0),
      paddingRight: px(0),
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px(0),
      marginBottom: px("0"),
    },
    mobileWrapper: {},
    class: {},
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      formId: { value: formId, text: "" },
      action: { value: "none" },
      visitWebsite: { value: { url: "", newTab: false } },
      customClass: { value: [] },
    },
    customCss: [],
  };
}

export function createSurvey(surveyId: string): BaseNode {
  const id = generateId("survey");

  return {
    id,
    type: "element",
    meta: "survey",
    tagName: "c-survey",
    title: "Survey",
    tag: "",
    child: [],
    styles: {
      paddingTop: px(0),
      paddingBottom: px(0),
      paddingLeft: px(10),
      paddingRight: px(10),
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px(0),
      marginBottom: px(0),
      marginLeft: px(0),
      marginRight: px(0),
      width: { value: "auto", unit: "" },
      height: { value: "auto", unit: "" },
    },
    mobileWrapper: {},
    class: {},
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      surveyId: { value: surveyId },
      action: { value: "none" },
      visitWebsite: { value: { url: "", newTab: false } },
      customClass: { value: [] },
    },
    customCss: [],
  };
}

export function createCalendar(calendarId: string): BaseNode {
  const id = generateId("calendar");

  return {
    id,
    type: "element",
    meta: "calendar",
    tagName: "c-calendar",
    title: "Calendar",
    tag: "",
    child: [],
    styles: {
      paddingTop: px(0),
      paddingBottom: px(0),
      paddingLeft: px(0),
      paddingRight: px(0),
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px(0),
      marginBottom: px(0),
      marginLeft: px(0),
      marginRight: px(0),
    },
    mobileWrapper: {},
    class: {},
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      calendarId: { value: calendarId, providerId: "", text: "", isTeamSelected: false },
      action: { value: "none" },
      visitWebsite: { value: { url: "", newTab: false } },
      customClass: { value: [] },
    },
    customCss: [],
  };
}

export function createCustomCode(html: string): BaseNode {
  const id = generateId("custom-code");

  return {
    id,
    type: "element",
    meta: "custom-code",
    tagName: "c-custom-code",
    title: "Custom Code",
    tag: "",
    child: [],
    styles: {},
    mobileStyles: {},
    wrapper: {
      marginTop: px(0),
      marginBottom: px(0),
      marginLeft: px(0),
      marginRight: px(0),
      width: { value: "auto", unit: "" },
      height: { value: "auto", unit: "" },
    },
    mobileWrapper: {},
    class: {},
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      customCode: { value: { rawCustomCode: html } },
      customClass: { value: [] },
    },
    customCss: [],
  };
}

export interface VideoOptions {
  autoplay?: boolean;
  loop?: boolean;
}

export function createVideo(url: string, opts: VideoOptions = {}): BaseNode {
  const id = generateId("video");

  // Derive embed URL and type for common providers
  let embedUrl = url;
  let videoType = "custom";
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (ytMatch) {
    videoType = "youtube";
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
  } else if (url.includes("vimeo.com")) {
    videoType = "vimeo";
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    embedUrl = vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` : url;
  }

  return {
    id,
    type: "element",
    meta: "video",
    tagName: "c-video",
    title: "Video",
    tag: "",
    child: [],
    styles: {
      paddingLeft: px(10),
      paddingRight: px(10),
      paddingTop: px(10),
      paddingBottom: px(10),
      backgroundColor: cssVar("var(--transparent)"),
      borderColor: cssVar("var(--black)"),
      borderWidth: { value: "2", unit: "px" },
      borderStyle: cssVar("solid"),
    },
    mobileStyles: {},
    wrapper: {
      marginTop: px(0),
      marginBottom: px(0),
    },
    mobileWrapper: {},
    class: {
      boxShadow: { value: "none" },
      borders: { value: "noBorder" },
      borderRadius: { value: "radius0" },
      radiusEdge: { value: "none" },
    },
    extra: {
      nodeId: `c${id}`,
      visibility: defaultVisibility(),
      videoProperties: {
        value: {
          url,
          type: videoType,
          autoplay: opts.autoplay ? 1 : 0,
          controls: 1,
          thumbnailURL: "",
          embedURL: embedUrl,
          width: 100,
          domain: "",
          loop: opts.loop ? 1 : 0,
        },
      },
      customClass: { value: [] },
    },
    customCss: [],
  };
}

export function createFaq(items: Array<{ question: string; answer: string }>): BaseNode {
  const id = generateId("faq");

  const faqList = items.map((item, i) => ({
    id: i + 1,
    heading: `<h4>${item.question}</h4>`,
    text: `<p>${item.answer}</p>`,
    showImage: false,
    image: "",
    active: i === 0,
  }));

  return {
    id,
    type: "element",
    meta: "faq",
    tagName: "c-faq",
    title: "FAQ",
    tag: "",
    version: 2,
    child: [],
    styles: {
      faqOpenTitleTextColor: cssVar("#3B82F6"),
      faqOpenTitleBackgroundColor: cssVar("var(--white)"),
      faqDividerColor: cssVar("var(--gray)"),
      faqContentTextColor: cssVar("var(--black)"),
      faqOpenBackgroundColor: cssVar("var(--white)"),
      faqClosedTitleTextColor: cssVar("#111827"),
      faqClosedTitleBackgroundColor: cssVar("var(--white)"),
      faqExpandAllButtonTextColor: cssVar("#3B82F6"),
      faqExpandAllButtonBorderColor: cssVar("#D1D5DB"),
      faqExpandAllButtonBackgroundColor: cssVar("var(--transparent)"),
      linkTextColor: cssVar("#3B82F6"),
      faqHeadingFontFamily: cssVar("var(--headlinefont)"),
      faqContentFontFamily: cssVar("var(--contentfont)"),
      paddingLeft: px(10),
      paddingRight: px(10),
      paddingTop: px(10),
      paddingBottom: px(10),
      marginTop: px(0),
      marginBottom: px(0),
      borderColor: cssVar("var(--black)"),
      borderStyle: cssVar("solid"),
      borderWidth: { value: "2", unit: "px" },
    },
    mobileStyles: {},
    wrapper: {},
    mobileWrapper: {},
    class: {
      borders: { value: "noBorder" },
      borderRadius: { value: "radius0" },
      radiusEdge: { value: "none" },
      boxShadow: { value: "none" },
    },
    extra: {
      nodeId: `c${id}`,
      faqType: { value: "separated" },
      faqList: { value: faqList },
      typography: { value: "var(--contentfont)" },
      faqCustomOptions: {
        value: {
          openIcon: { color: "var(--black)", fontFamily: "Font Awesome 5 Free", name: "chevron-down", unicode: "f078" },
          closeIcon: { color: "var(--black)", fontFamily: "Font Awesome 5 Free", name: "chevron-up", unicode: "f077" },
          iconPosition: "right",
          lineHeight: "1.5",
          showImagePopup: false,
          expandAllToggle: false,
          expandAll: true,
          firstItemOpen: true,
        },
      },
      featureHeadlineDesktopFontSize: { value: 20, unit: "px" },
      featureHeadlineMobileFontSize: { value: 15, unit: "px" },
      desktopFontSize: { value: 15, unit: "px" },
      mobileFontSize: { value: 12, unit: "px" },
      visibility: defaultVisibility(),
      customClass: { value: [] },
    },
    customCss: [],
  };
}

const SOCIAL_ICON_URLS: Record<string, string> = {
  instagram: "https://stcdn.leadconnectorhq.com/funnel/icons/brand/instagram-brand.svg",
  facebook: "https://stcdn.leadconnectorhq.com/funnel/icons/brand/facebook-brand.svg",
  tiktok: "https://stcdn.leadconnectorhq.com/funnel/icons/brand/tiktok-brand.svg",
  x: "https://stcdn.leadconnectorhq.com/funnel/icons/brand/x-brand.svg",
  twitter: "https://stcdn.leadconnectorhq.com/funnel/icons/brand/x-brand.svg",
  youtube: "https://stcdn.leadconnectorhq.com/funnel/icons/brand/youtube-brand.svg",
  linkedin: "https://stcdn.leadconnectorhq.com/funnel/icons/brand/linkedin-brand.svg",
};

export function createSocialIcons(socials: Array<{ platform: string; url: string }>): BaseNode {
  const id = generateId("social-icons");

  const socialsValue = socials.map((s) => ({
    id: s.platform.toLowerCase(),
    label: s.platform.charAt(0).toUpperCase() + s.platform.slice(1),
    icon: SOCIAL_ICON_URLS[s.platform.toLowerCase()] ?? "",
    newWindow: true,
    nofollow: false,
    link: s.url,
  }));

  return {
    id,
    type: "element",
    meta: "social-icons",
    tagName: "c-social-icons",
    title: "Social Icons",
    tag: "",
    version: 2,
    child: [],
    styles: {
      fontFamily: cssVar("Inter"),
      fontSize: { value: 12, unit: "px" },
      fontWeight: { value: 500 },
      color: cssVar("#000000"),
      paddingTop: px(10),
      paddingBottom: px(10),
      paddingLeft: px(10),
      paddingRight: px(10),
      marginTop: px(10),
      marginBottom: px(10),
      marginRight: px(0),
      marginLeft: px(0),
    },
    mobileStyles: {
      paddingLeft: px(0),
      paddingRight: px(0),
    },
    wrapper: {},
    mobileWrapper: {},
    class: {},
    extra: {
      nodeId: `c${id}`,
      socials: { value: socialsValue },
      displayType: { value: "icon" },
      theme: { value: "white" },
      align: { value: "center" },
      iconSize: { value: { height: 40, width: 40 } },
      customClass: { value: [] },
      visibility: defaultVisibility(),
    },
    customCss: [],
  };
}

// ---------------------------------------------------------------------------
// Assembly helpers
// ---------------------------------------------------------------------------

/**
 * Wrap a metaData node and a flat elements array into the full SectionData
 * envelope that the GHL autosave payload expects.
 */
export function buildSectionData(
  section: BaseNode,
  elements: BaseNode[],
  pageId: string,
  funnelId: string,
  locationId: string,
  colors: Array<{ label: string; value: string }> = [
    { label: "Transparent", value: "transparent" },
    { label: "Black", value: "#000000" },
  ],
): SectionData {
  const rootVars: Record<string, string> = {};
  for (const c of colors) {
    rootVars[`--${c.label.toLowerCase().replace(/\s+/g, "-")}`] = c.value;
  }

  // Build a minimal sectionStyles CSS block matching the real payload format
  const sid = section.id;
  const cssVarBlock = `:root{${Object.entries(rootVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}.hl_page-preview--content .${sid}{padding:20px 0;margin:0}#${sid}>.inner{max-width:1170px}`;

  return {
    id: sid,
    metaData: { ...section },
    elements,
    sequence: 0,
    pageId,
    funnelId,
    locationId,
    general: {
      colors,
      fontsForPreview: [],
      rootVars,
      sectionStyles: cssVarBlock,
      customFonts: [],
    },
  };
}

/**
 * Convenience builder: place an array of leaf elements into a single-row
 * section with the specified column count. Returns a ready-to-use SectionData.
 *
 * Leaf elements are distributed round-robin across columns if multiple columns
 * are specified.
 */
export function buildSimpleSection(
  leafElements: BaseNode[],
  pageId: string,
  funnelId: string,
  locationId: string,
  opts: {
    columns?: number;
    sectionOpts?: SectionOptions;
    colors?: Array<{ label: string; value: string }>;
  } = {},
): SectionData {
  const columnCount = opts.columns ?? 1;
  const section = createSection(opts.sectionOpts);
  const { row, columns } = createRow({ columns: columnCount });

  // Assign leaf element IDs to columns (round-robin)
  const workingColumns = columns.map((c) => ({ ...c, child: [] as string[] }));
  for (let i = 0; i < leafElements.length; i++) {
    workingColumns[i % columnCount].child.push(leafElements[i].id);
  }

  // section.child = [rowId]
  const filledSection = { ...section, child: [row.id] };
  // row.child already set to column IDs
  const filledRow = { ...row, child: workingColumns.map((c) => c.id) };

  // Flat elements array: row, columns, leaf elements
  const flatElements: BaseNode[] = [
    filledRow,
    ...workingColumns,
    ...leafElements,
  ];

  // Set metaData.child = [row.id]
  filledSection.child = [row.id];

  return buildSectionData(
    filledSection,
    flatElements,
    pageId,
    funnelId,
    locationId,
    opts.colors,
  );
}

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";

/* ───────── colour tokens ───────── */
const C = {
  bg: "#f0f2f5",
  sidebar: "#001529",
  sideHover: "#1890ff22",
  sideActive: "#1890ff",
  white: "#fff",
  card: "#fff",
  border: "#e8e8e8",
  primary: "#1890ff",
  primaryDark: "#096dd9",
  success: "#52c41a",
  warning: "#faad14",
  danger: "#ff4d4f",
  textPrimary: "#262626",
  textSecondary: "#595959",
  textTertiary: "#8c8c8c",
  tagBlue: "#e6f7ff",
  tagGreen: "#f6ffed",
  tagOrange: "#fff7e6",
  tagRed: "#fff1f0",
};

/* ───────── icon helpers (pure SVG) ───────── */
const Icon = ({ d, size = 16, color = "currentColor", ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d={d} />
  </svg>
);
const Icons = {
  doc: (p) => <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" {...p} />,
  flow: (p) => <Icon d="M12 2v6m0 8v6M2 12h6m8 0h6" {...p} />,
  search: (p) => <Icon d="M11 3a8 8 0 100 16 8 8 0 000-16zM21 21l-4.35-4.35" {...p} />,
  plus: (p) => <Icon d="M12 5v14M5 12h14" {...p} />,
  check: (p) => <Icon d="M20 6L9 17l-5-5" {...p} />,
  eye: (p) => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z" {...p} />,
  clock: (p) => <Icon d="M12 2a10 10 0 100 20 10 10 0 000-20z M12 6v6l4 2" {...p} />,
  users: (p) => <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 3a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" {...p} />,
  lock: (p) => <Icon d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4" {...p} />,
  history: (p) => <Icon d="M3 3v5h5 M3 8a9 9 0 1018 0 9 9 0 00-18 0z M12 7v5l3 3" {...p} />,
  settings: (p) => <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.18a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z" {...p} />,
  chevDown: (p) => <Icon d="M6 9l6 6 6-6" {...p} />,
  chevRight: (p) => <Icon d="M9 18l6-6-6-6" {...p} />,
  edit: (p) => <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...p} />,
  trash: (p) => <Icon d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" {...p} />,
  download: (p) => <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" {...p} />,
  bell: (p) => <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" {...p} />,
  home: (p) => <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" {...p} />,
  tag: (p) => <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01" {...p} />,
  send: (p) => <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" {...p} />,
  x: (p) => <Icon d="M18 6L6 18M6 6l12 12" {...p} />,
  filter: (p) => <Icon d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" {...p} />,
  arrowLeft: (p) => <Icon d="M19 12H5M12 19l-7-7 7-7" {...p} />,
  grid: (p) => <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" {...p} />,
  list: (p) => <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" {...p} />,
  upload: (p) => <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" {...p} />,
  copy: (p) => <Icon d="M20 9H11a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2z M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" {...p} />,
  bookmark: (p) => <Icon d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" {...p} />,
};

/* ───────── seed data ───────── */
const CATEGORIES = ["全部", "人事制度", "财务流程", "IT 管理", "行政制度", "合规制度"];
const STATUS_MAP = {
  published: { label: "已发布", color: C.success, bg: C.tagGreen },
  draft: { label: "草稿", color: C.warning, bg: C.tagOrange },
  review: { label: "审核中", color: C.primary, bg: C.tagBlue },
  archived: { label: "已归档", color: C.textTertiary, bg: "#f5f5f5" },
  revoked: { label: "已废止", color: C.danger, bg: C.tagRed },
};

const DOCS = [
  { id: 1, code: "HR-001", title: "员工入职管理办法", category: "人事制度", status: "published", version: "3.0", dept: "人力资源部", author: "张三", publishDate: "2025-12-01", effectDate: "2026-01-01", readRate: 87, views: 342, scope: ["全公司"], hasFlow: true },
  { id: 2, code: "FIN-003", title: "差旅费用报销制度", category: "财务流程", status: "published", version: "2.1", dept: "财务部", author: "李四", publishDate: "2025-11-15", effectDate: "2025-12-01", readRate: 72, views: 256, scope: ["全公司"], hasFlow: true },
  { id: 3, code: "IT-012", title: "信息安全管理规定", category: "IT 管理", status: "review", version: "1.2", dept: "信息技术部", author: "王五", publishDate: "-", effectDate: "-", readRate: 0, views: 45, scope: ["IT部", "运维部"], hasFlow: true },
  { id: 4, code: "ADM-007", title: "办公用品采购流程", category: "行政制度", status: "draft", version: "1.0", dept: "行政部", author: "赵六", publishDate: "-", effectDate: "-", readRate: 0, views: 12, scope: ["行政部"], hasFlow: false },
  { id: 5, code: "COM-002", title: "反洗钱合规操作手册", category: "合规制度", status: "published", version: "4.0", dept: "合规部", author: "钱七", publishDate: "2025-10-20", effectDate: "2025-11-01", readRate: 95, views: 510, scope: ["全公司"], hasFlow: true },
  { id: 6, code: "HR-009", title: "绩效考核管理制度", category: "人事制度", status: "published", version: "2.0", dept: "人力资源部", author: "张三", publishDate: "2025-09-01", effectDate: "2025-10-01", readRate: 64, views: 198, scope: ["全公司"], hasFlow: true },
  { id: 7, code: "FIN-008", title: "预算编制与执行管理办法", category: "财务流程", status: "archived", version: "1.5", dept: "财务部", author: "李四", publishDate: "2024-06-01", effectDate: "2024-07-01", readRate: 91, views: 420, scope: ["管理层", "财务部"], hasFlow: false },
  { id: 8, code: "IT-015", title: "系统上线发布流程", category: "IT 管理", status: "draft", version: "0.9", dept: "信息技术部", author: "王五", publishDate: "-", effectDate: "-", readRate: 0, views: 8, scope: ["IT部"], hasFlow: true },
  { id: 9, code: "ADM-011", title: "会议室预约管理制度", category: "行政制度", status: "revoked", version: "1.3", dept: "行政部", author: "赵六", publishDate: "2023-03-01", effectDate: "2023-04-01", readRate: 78, views: 300, scope: ["全公司"], hasFlow: false },
  { id: 10, code: "COM-005", title: "数据隐私保护政策", category: "合规制度", status: "review", version: "2.0", dept: "合规部", author: "钱七", publishDate: "-", effectDate: "-", readRate: 0, views: 67, scope: ["全公司"], hasFlow: true },
];

const VERSIONS = [
  { ver: "3.0", date: "2025-12-01", author: "张三", change: "全面修订入职流程，新增电子签章环节", status: "published",
    chapters: [
      { title: "第一章 总则", content: "1.1 为规范公司员工入职管理，保障公司及员工合法权益，特制定本办法。\n1.2 本办法适用于公司所有新入职员工（含正式员工、实习生、外包人员）。\n1.3 人力资源部为入职管理的主责部门，各业务部门应予以配合。" },
      { title: "第二章 入职条件", content: "2.1 应聘者须通过公司面试流程并获得录用通知。\n2.2 入职前须完成体检（线上/线下均可）并上传电子版报告。\n2.3 须提供身份证、学历证书、离职证明等材料的电子扫描件。\n2.4 背景调查结果须符合公司用人标准。" },
      { title: "第三章 入职流程", content: "3.1 HR 发起入职流程，系统自动创建入职任务单。\n3.2 HR 系统化审核入职材料（增加自动校验）。\n3.3 电子 Offer 签章（集成电子签章平台）。\n3.4 完成背景调查（学历验证、前雇主背调）。\n3.5 HR 主管审批确认。\n3.6 安排入职培训、开通邮箱、门禁、OA 系统等。\n3.7 签订劳动合同（电子签章）。" },
      { title: "第四章 培训安排", content: "4.1 新员工入职首日须参加公司文化培训（线上/线下）。\n4.2 入职一周内完成部门业务培训。\n4.3 试用期内须完成必修课程学习并通过考核。" },
      { title: "第五章 附则", content: "5.1 本办法自 2026 年 1 月 1 日起施行。\n5.2 本办法由人力资源部负责解释和修订。\n5.3 远程入职特殊流程说明：远程入职员工可通过视频方式完成身份核验，材料通过邮寄或电子方式提交。" },
    ]},
  { ver: "2.1", date: "2025-08-15", author: "张三", change: "优化体检环节说明", status: "archived",
    chapters: [
      { title: "第一章 总则", content: "1.1 为规范公司员工入职管理，保障公司及员工合法权益，特制定本办法。\n1.2 本办法适用于公司所有新入职员工（含正式员工、实习生、外包人员）。\n1.3 人力资源部为入职管理的主责部门，各业务部门应予以配合。" },
      { title: "第二章 入职条件", content: "2.1 应聘者须通过公司面试流程并获得录用通知。\n2.2 入职前须完成线下体检并提交纸质报告。\n2.3 须提供身份证、学历证书、离职证明等材料原件及复印件。\n2.4 背景调查结果须符合公司用人标准。" },
      { title: "第三章 入职流程", content: "3.1 HR 发起入职流程。\n3.2 HR 人工审核入职材料。\n3.3 纸质 Offer 签署。\n3.4 完成背景调查。\n3.5 HR 主管审批确认。\n3.6 安排入职培训、开通系统账号。\n3.7 签订纸质劳动合同。" },
      { title: "第四章 培训安排", content: "4.1 新员工入职首日须参加公司文化培训。\n4.2 入职一周内完成部门业务培训。\n4.3 试用期内须完成必修课程学习并通过考核。" },
      { title: "第五章 附则", content: "5.1 本办法自 2025 年 9 月 1 日起施行。\n5.2 本办法由人力资源部负责解释和修订。" },
    ]},
  { ver: "2.0", date: "2025-03-01", author: "李四", change: "增加远程入职流程", status: "archived",
    chapters: [
      { title: "第一章 总则", content: "1.1 为规范公司员工入职管理，特制定本办法。\n1.2 本办法适用于公司所有新入职正式员工。\n1.3 人力资源部为入职管理的主责部门。" },
      { title: "第二章 入职条件", content: "2.1 应聘者须通过面试并获得录用通知。\n2.2 入职前须完成线下体检并提交报告。\n2.3 须提供身份证、学历证书等材料原件。" },
      { title: "第三章 入职流程", content: "3.1 HR 发起入职流程。\n3.2 HR 人工审核入职材料。\n3.3 纸质 Offer 签署。\n3.4 安排入职培训。\n3.5 签订劳动合同。" },
      { title: "第四章 附则", content: "4.1 本办法自 2025 年 4 月 1 日起施行。\n4.2 本办法由人力资源部负责解释。" },
    ]},
  { ver: "1.0", date: "2024-06-01", author: "李四", change: "初始版本发布", status: "archived",
    chapters: [
      { title: "第一章 总则", content: "1.1 为规范入职管理，特制定本办法。\n1.2 适用于全体新入职员工。" },
      { title: "第二章 入职流程", content: "2.1 提交入职材料。\n2.2 HR 审核。\n2.3 签署劳动合同。\n2.4 安排工位与设备。" },
      { title: "第三章 附则", content: "3.1 本办法自 2024 年 7 月 1 日起施行。" },
    ]},
];

const AUDIT_LOG = [
  { time: "2025-12-01 14:30", user: "张三", action: "发布文档", detail: "发布 v3.0 版本" },
  { time: "2025-12-01 11:20", user: "王总", action: "审批通过", detail: "终审通过 v3.0" },
  { time: "2025-11-28 16:45", user: "李主管", action: "审批通过", detail: "初审通过 v3.0" },
  { time: "2025-11-25 09:10", user: "张三", action: "提交审核", detail: "提交 v3.0 版本审核" },
  { time: "2025-11-20 15:30", user: "张三", action: "编辑文档", detail: "修改第三章第2节内容" },
  { time: "2025-11-18 10:00", user: "张三", action: "创建版本", detail: "创建 v3.0 草稿" },
  { time: "2025-08-15 09:00", user: "张三", action: "发布文档", detail: "发布 v2.1 版本" },
];

const READ_CONFIRM = [
  { name: "张明", dept: "市场部", readTime: "2025-12-02 09:15", confirmed: true },
  { name: "刘洋", dept: "技术部", readTime: "2025-12-02 10:30", confirmed: true },
  { name: "陈静", dept: "财务部", readTime: "2025-12-03 14:20", confirmed: true },
  { name: "周伟", dept: "销售部", readTime: "2025-12-04 08:45", confirmed: true },
  { name: "吴芳", dept: "人力资源部", readTime: "2025-12-05 16:00", confirmed: true },
  { name: "孙磊", dept: "运营部", readTime: "-", confirmed: false },
  { name: "郑霞", dept: "法务部", readTime: "-", confirmed: false },
  { name: "何强", dept: "产品部", readTime: "-", confirmed: false },
];

const FLOW_NODES = [
  { id: "start", label: "发起入职", type: "start", x: 80, y: 170 },
  { id: "n1", label: "HR 初审\n资料完整性", type: "process", x: 240, y: 170 },
  { id: "n2", label: "背景调查", type: "process", x: 420, y: 170 },
  { id: "d1", label: "是否通过?", type: "decision", x: 600, y: 170 },
  { id: "n3", label: "发放 Offer\n电子签章", type: "process", x: 780, y: 110 },
  { id: "n4", label: "入职培训\n系统开通", type: "process", x: 960, y: 110 },
  { id: "end", label: "入职完成", type: "end", x: 1120, y: 110 },
  { id: "n5", label: "退回/终止", type: "reject", x: 780, y: 260 },
];
const FLOW_EDGES = [
  { from: "start", to: "n1" },
  { from: "n1", to: "n2" },
  { from: "n2", to: "d1" },
  { from: "d1", to: "n3", label: "是" },
  { from: "d1", to: "n5", label: "否" },
  { from: "n3", to: "n4" },
  { from: "n4", to: "end" },
];

/* ───────── reusable tiny components ───────── */
const Badge = ({ children, color, bg }) => (
  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 10, fontSize: 12, fontWeight: 500, color, background: bg, lineHeight: "20px", whiteSpace: "nowrap" }}>{children}</span>
);

const Btn = ({ children, primary, danger, ghost, small, icon, onClick, disabled, style: s }) => {
  const [hov, setHov] = useState(false);
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid", borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
    fontSize: small ? 12 : 14, padding: small ? "3px 10px" : "6px 16px", fontWeight: 500, transition: "all .2s", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap",
    background: primary ? (hov ? C.primaryDark : C.primary) : danger ? (hov ? "#cf1322" : C.danger) : ghost ? "transparent" : (hov ? "#fafafa" : C.white),
    color: primary ? C.white : danger ? C.white : ghost ? C.primary : C.textPrimary,
    borderColor: primary ? C.primary : danger ? C.danger : ghost ? C.primary : C.border,
    ...s,
  };
  return <button style={base} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick} disabled={disabled}>{icon}{children}</button>;
};

const Input = ({ placeholder, value, onChange, icon, style: s }) => (
  <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", background: C.white, gap: 8, ...s }}>
    {icon}
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ border: "none", outline: "none", flex: 1, fontSize: 14, color: C.textPrimary, background: "transparent" }} />
  </div>
);

const Tab = ({ labels, active, onChange }) => (
  <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${C.border}`, marginBottom: 16 }}>
    {labels.map((l, i) => (
      <div key={i} onClick={() => onChange(i)} style={{ padding: "10px 20px", cursor: "pointer", fontWeight: active === i ? 600 : 400, color: active === i ? C.primary : C.textSecondary, borderBottom: active === i ? `2px solid ${C.primary}` : "2px solid transparent", marginBottom: -2, fontSize: 14, transition: "all .2s" }}>{l}</div>
    ))}
  </div>
);

const Stat = ({ label, value, color, suffix }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 28, fontWeight: 700, color: color || C.textPrimary }}>{value}<span style={{ fontSize: 14, fontWeight: 400, color: C.textTertiary }}>{suffix}</span></div>
    <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 4 }}>{label}</div>
  </div>
);

const ProgressBar = ({ pct, color }) => (
  <div style={{ height: 8, borderRadius: 4, background: "#f0f0f0", overflow: "hidden", flex: 1 }}>
    <div style={{ height: "100%", width: `${pct}%`, background: color || C.primary, borderRadius: 4, transition: "width .6s ease" }} />
  </div>
);

const Card = ({ children, style: s, onClick }) => (
  <div onClick={onClick} style={{ background: C.card, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,.08)", border: `1px solid ${C.border}`, ...s }}>{children}</div>
);

/* ───────── modal ───────── */
const Modal = ({ open, title, width, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)" }} onClick={onClose} />
      <div style={{ position: "relative", background: C.white, borderRadius: 12, width: width || 520, maxHeight: "85vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{title}</span>
          <span style={{ cursor: "pointer", padding: 4 }} onClick={onClose}>{Icons.x({ size: 18, color: C.textTertiary })}</span>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

/* ───────── flow diagram (SVG) ───────── */
const FlowDiagram = () => {
  const [hovered, setHovered] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const nodeW = 130, nodeH = 56;

  const getCenter = (n) => {
    if (n.type === "decision") return { cx: n.x, cy: n.y };
    return { cx: n.x + nodeW / 2, cy: n.y + nodeH / 2 };
  };

  const nodeDetails = {
    start: { role: "申请人", sla: "-", desc: "员工或 HR 代为发起入职申请" },
    n1: { role: "HR 专员", sla: "1 个工作日", desc: "审核证件、学历、合同等资料完整性" },
    n2: { role: "HR 专员 / 外部", sla: "3 个工作日", desc: "进行学历验证、前雇主背调" },
    d1: { role: "HR 主管", sla: "1 个工作日", desc: "根据背调结果决定是否继续" },
    n3: { role: "HR 专员", sla: "1 个工作日", desc: "生成电子 Offer 并发送签章" },
    n4: { role: "HR / IT / 行政", sla: "2 个工作日", desc: "安排培训、开通邮箱、门禁等" },
    end: { role: "-", sla: "-", desc: "入职手续全部完成" },
    n5: { role: "HR 专员", sla: "-", desc: "不符合条件，终止入职流程" },
  };

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox="0 0 1220 340" style={{ background: "#fafbfc", borderRadius: 8, border: `1px solid ${C.border}` }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 3.5L0 7z" fill={C.textTertiary} /></marker>
          <filter id="nodeShadow"><feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity=".1" /></filter>
        </defs>
        {/* edges */}
        {FLOW_EDGES.map((e, i) => {
          const f = FLOW_NODES.find(n => n.id === e.from);
          const t = FLOW_NODES.find(n => n.id === e.to);
          const fc = getCenter(f), tc = getCenter(t);
          let path;
          if (f.type === "decision" && e.label === "否") {
            path = `M${fc.cx},${fc.cy + 35} L${tc.cx + nodeW / 2},${tc.cy}`;
          } else if (f.type === "decision") {
            path = `M${fc.cx + 40},${fc.cy} L${tc.cx},${tc.cy + nodeH / 2}`;
          } else {
            path = `M${fc.cx + (f.type === "start" ? 25 : nodeW / 2)},${fc.cy} L${tc.cx - (t.type === "decision" ? 40 : (t.type === "end" ? 25 : nodeW / 2))},${tc.cy}`;
          }
          return (
            <g key={i}>
              <path d={path} stroke={C.textTertiary} strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
              {e.label && (() => {
                const mx = (fc.cx + tc.cx + (t.type === "reject" ? nodeW / 2 : 0)) / 2;
                const my = (fc.cy + tc.cy + (t.type === "reject" ? 0 : 0)) / 2 - 8;
                return <text x={mx} y={my} textAnchor="middle" fontSize="11" fill={e.label === "否" ? C.danger : C.success} fontWeight="600">{e.label}</text>;
              })()}
            </g>
          );
        })}
        {/* nodes */}
        {FLOW_NODES.map(n => {
          const isHov = hovered === n.id;
          const colors = {
            start: { fill: "#e6f7ff", stroke: C.primary },
            end: { fill: C.tagGreen, stroke: C.success },
            process: { fill: C.white, stroke: isHov ? C.primary : "#d9d9d9" },
            decision: { fill: "#fff7e6", stroke: C.warning },
            reject: { fill: C.tagRed, stroke: C.danger },
          };
          const c = colors[n.type];
          if (n.type === "start" || n.type === "end") {
            return (
              <g key={n.id} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)} onClick={() => setActiveNode(n.id === activeNode ? null : n.id)} style={{ cursor: "pointer" }}>
                <circle cx={n.x} cy={n.y} r={25} fill={c.fill} stroke={c.stroke} strokeWidth="2" filter="url(#nodeShadow)" />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill={c.stroke}>{n.label}</text>
              </g>
            );
          }
          if (n.type === "decision") {
            return (
              <g key={n.id} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)} onClick={() => setActiveNode(n.id === activeNode ? null : n.id)} style={{ cursor: "pointer" }}>
                <polygon points={`${n.x},${n.y - 35} ${n.x + 45},${n.y} ${n.x},${n.y + 35} ${n.x - 45},${n.y}`} fill={c.fill} stroke={c.stroke} strokeWidth="2" filter="url(#nodeShadow)" />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill={C.textPrimary}>{n.label}</text>
              </g>
            );
          }
          return (
            <g key={n.id} onMouseEnter={() => setHovered(n.id)} onMouseLeave={() => setHovered(null)} onClick={() => setActiveNode(n.id === activeNode ? null : n.id)} style={{ cursor: "pointer" }}>
              <rect x={n.x} y={n.y} width={nodeW} height={nodeH} rx={8} fill={c.fill} stroke={c.stroke} strokeWidth={isHov ? 2 : 1.5} filter="url(#nodeShadow)" />
              {n.label.split("\n").map((line, li) => (
                <text key={li} x={n.x + nodeW / 2} y={n.y + (n.label.includes("\n") ? 20 + li * 18 : nodeH / 2 + 1)} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="500" fill={n.type === "reject" ? C.danger : C.textPrimary}>{line}</text>
              ))}
            </g>
          );
        })}
      </svg>
      {/* detail popover */}
      {activeNode && nodeDetails[activeNode] && (() => {
        const nd = FLOW_NODES.find(n => n.id === activeNode);
        const det = nodeDetails[activeNode];
        return (
          <div style={{ position: "absolute", left: Math.min(nd.x, 1000), top: (nd.type === "reject" ? nd.y + 60 : nd.y - 10), background: C.white, borderRadius: 8, padding: 16, boxShadow: "0 4px 16px rgba(0,0,0,.15)", border: `1px solid ${C.border}`, width: 220, zIndex: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{nd.label.replace("\n", " ")}</div>
            <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4 }}>负责人: {det.role}</div>
            <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4 }}>SLA: {det.sla}</div>
            <div style={{ fontSize: 12, color: C.textTertiary }}>{det.desc}</div>
          </div>
        );
      })()}
    </div>
  );
};

/* ───────── new / edit document modal ───────── */
const DocFormModal = ({ open, onClose, doc }) => {
  const isEdit = !!doc;
  const [form, setForm] = useState({
    title: doc?.title || "", code: doc?.code || "", category: doc?.category || "人事制度", dept: doc?.dept || "", scope: "全公司", requireConfirm: true,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: C.textSecondary }}>{label}</div>
      {children}
    </div>
  );
  const inp = (v, k, ph) => <input value={v} onChange={e => set(k, e.target.value)} placeholder={ph} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" }} />;
  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "编辑文档" : "新建文档"} width={560}>
      <Field label="文档编号">{inp(form.code, "code", "例: HR-001")}</Field>
      <Field label="文档标题">{inp(form.title, "title", "请输入文档标题")}</Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="所属分类">
          <select value={form.category} onChange={e => set("category", e.target.value)} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14 }}>
            {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="责任部门">{inp(form.dept, "dept", "例: 人力资源部")}</Field>
      </div>
      <Field label="可见范围">
        <select value={form.scope} onChange={e => set("scope", e.target.value)} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14 }}>
          <option>全公司</option><option>管理层</option><option>指定部门</option>
        </select>
      </Field>
      <Field label="">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
          <input type="checkbox" checked={form.requireConfirm} onChange={e => set("requireConfirm", e.target.checked)} />
          要求员工阅读确认
        </label>
      </Field>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn ghost onClick={onClose}>取消</Btn>
        <Btn primary onClick={onClose}>{isEdit ? "保存" : "创建"}</Btn>
      </div>
    </Modal>
  );
};

/* ───────── publish modal ───────── */
const PublishModal = ({ open, onClose, doc }) => {
  const [step, setStep] = useState(0);
  if (!doc) return null;
  return (
    <Modal open={open} onClose={onClose} title="发布文档" width={500}>
      {step === 0 && (
        <>
          <div style={{ padding: 16, background: "#f6f6f6", borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{doc.title}</div>
            <div style={{ fontSize: 13, color: C.textSecondary }}>版本 {doc.version} → 将发布并生效</div>
          </div>
          <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 8 }}>发布后：</div>
          <ul style={{ fontSize: 13, color: C.textSecondary, paddingLeft: 20, lineHeight: 2 }}>
            <li>文档状态变更为「已发布」</li>
            <li>可见范围内的员工将收到通知</li>
            <li>需阅读确认的员工将收到待办任务</li>
            <li>旧版本自动归档</li>
          </ul>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn ghost onClick={onClose}>取消</Btn>
            <Btn primary onClick={() => setStep(1)} icon={Icons.send({ size: 14, color: C.white })}>确认发布</Btn>
          </div>
        </>
      )}
      {step === 1 && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.tagGreen, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{Icons.check({ size: 28, color: C.success })}</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>发布成功</div>
          <div style={{ fontSize: 14, color: C.textSecondary }}>已向 {doc.scope.join("、")} 范围内的员工发送通知</div>
          <Btn primary onClick={onClose} style={{ marginTop: 20 }}>完成</Btn>
        </div>
      )}
    </Modal>
  );
};

/* ───────── version diff modal ───────── */
const DiffModal = ({ open, onClose }) => {
  const diffs = [
    { section: "第一章 总则", type: "unchanged" },
    { section: "第二章 入职条件", type: "modified", old: "入职前须完成线下体检并提交纸质报告", new: "入职前须完成体检（线上/线下均可）并上传电子版报告" },
    { section: "第三章 入职流程", type: "modified", old: "3.2 HR 人工审核入职材料\n3.3 纸质 Offer 签署", new: "3.2 HR 系统化审核入职材料（增加自动校验）\n3.3 电子 Offer 签章（集成电子签章平台）" },
    { section: "第四章 培训安排", type: "unchanged" },
    { section: "第五章 附则", type: "added", new: "新增：5.3 远程入职特殊流程说明" },
  ];
  return (
    <Modal open={open} onClose={onClose} title="版本对比 — v2.1 → v3.0" width={700}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Badge color={C.success} bg={C.tagGreen}>+2 修改</Badge>
        <Badge color={C.primary} bg={C.tagBlue}>+1 新增</Badge>
        <Badge color={C.textTertiary} bg="#f5f5f5">2 无变更</Badge>
      </div>
      {diffs.map((d, i) => (
        <div key={i} style={{ marginBottom: 16, borderRadius: 8, border: `1px solid ${d.type === "unchanged" ? "#eee" : d.type === "added" ? "#b7eb8f" : "#ffd591"}`, overflow: "hidden" }}>
          <div style={{ padding: "8px 12px", background: d.type === "unchanged" ? "#fafafa" : d.type === "added" ? C.tagGreen : C.tagOrange, fontWeight: 600, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
            <span>{d.section}</span>
            <Badge color={d.type === "unchanged" ? C.textTertiary : d.type === "added" ? C.success : C.warning} bg="transparent">{d.type === "unchanged" ? "无变更" : d.type === "added" ? "新增" : "修改"}</Badge>
          </div>
          {d.type !== "unchanged" && (
            <div style={{ padding: 12, fontSize: 13 }}>
              {d.old && <div style={{ background: "#fff1f0", padding: 8, borderRadius: 4, marginBottom: 8, whiteSpace: "pre-wrap", color: C.danger }}>- {d.old}</div>}
              {d.new && <div style={{ background: "#f6ffed", padding: 8, borderRadius: 4, whiteSpace: "pre-wrap", color: C.success }}>+ {d.new}</div>}
            </div>
          )}
        </div>
      ))}
    </Modal>
  );
};

/* ───────── SIDEBAR ───────── */
const Sidebar = ({ nav, setNav, collapsed, setCollapsed }) => {
  const items = [
    { key: "dashboard", icon: Icons.home, label: "工作台" },
    { key: "docs", icon: Icons.doc, label: "文档管理" },
    { key: "flows", icon: Icons.flow, label: "流程管理" },
    { key: "audit", icon: Icons.history, label: "变更日志" },
    { key: "read", icon: Icons.check, label: "阅读确认" },
    { key: "perms", icon: Icons.lock, label: "权限设置" },
  ];
  return (
    <div style={{ width: collapsed ? 64 : 220, minWidth: collapsed ? 64 : 220, background: C.sidebar, display: "flex", flexDirection: "column", transition: "width .25s", overflow: "hidden", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: collapsed ? "20px 12px" : "20px 20px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setCollapsed(!collapsed)}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}, #36cfc9)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {Icons.doc({ size: 18, color: C.white })}
        </div>
        {!collapsed && <span style={{ color: C.white, fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>流程文档中心</span>}
      </div>
      <div style={{ flex: 1, marginTop: 8 }}>
        {items.map(it => {
          const active = nav === it.key;
          return (
            <div key={it.key} onClick={() => setNav(it.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: collapsed ? "12px 20px" : "11px 20px", margin: "2px 8px", borderRadius: 8, cursor: "pointer", background: active ? C.sideActive : "transparent", color: active ? C.white : "#ffffffb3", transition: "all .2s", position: "relative" }}>
              {it.icon({ size: 18, color: active ? C.white : "#ffffffb3" })}
              {!collapsed && <span style={{ fontSize: 14, whiteSpace: "nowrap" }}>{it.label}</span>}
            </div>
          );
        })}
      </div>
      {!collapsed && (
        <div style={{ padding: "16px 20px", borderTop: "1px solid #ffffff1a", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1890ff44", display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 13, fontWeight: 600 }}>管</div>
          <div><div style={{ color: C.white, fontSize: 13, fontWeight: 500 }}>管理员</div><div style={{ color: "#ffffff66", fontSize: 11 }}>admin@corp.com</div></div>
        </div>
      )}
    </div>
  );
};

/* ═══════════ PAGE: Dashboard ═══════════ */
const DashboardPage = ({ setNav, setDetailDoc }) => {
  const statusCounts = { published: DOCS.filter(d => d.status === "published").length, draft: DOCS.filter(d => d.status === "draft").length, review: DOCS.filter(d => d.status === "review").length, archived: DOCS.filter(d => d.status === "archived" || d.status === "revoked").length };
  return (
    <div>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>工作台</h2>
      <p style={{ color: C.textTertiary, marginBottom: 24, fontSize: 14 }}>流程与文档管理系统总览</p>
      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "已发布文档", value: statusCounts.published, color: C.success, icon: Icons.check },
          { label: "草稿文档", value: statusCounts.draft, color: C.warning, icon: Icons.edit },
          { label: "待审核", value: statusCounts.review, color: C.primary, icon: Icons.clock },
          { label: "已归档/废止", value: statusCounts.archived, color: C.textTertiary, icon: Icons.history },
        ].map((s, i) => (
          <Card key={i} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 13, color: C.textTertiary, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.icon({ size: 22, color: s.color })}
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* recent + pending */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>最近更新</span>
            <Btn small ghost onClick={() => setNav("docs")}>查看全部</Btn>
          </div>
          {DOCS.slice(0, 5).map(d => (
            <div key={d.id} onClick={() => { setDetailDoc(d); setNav("detail"); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
              <div>
                <span style={{ fontWeight: 500, fontSize: 14, color: C.textPrimary }}>{d.title}</span>
                <span style={{ fontSize: 12, color: C.textTertiary, marginLeft: 8 }}>v{d.version}</span>
              </div>
              <Badge {...STATUS_MAP[d.status]}>{STATUS_MAP[d.status].label}</Badge>
            </div>
          ))}
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>阅读确认概览</div>
          {DOCS.filter(d => d.status === "published").slice(0, 4).map(d => (
            <div key={d.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{d.title}</span>
                <span style={{ color: d.readRate > 80 ? C.success : d.readRate > 50 ? C.warning : C.danger, fontWeight: 600 }}>{d.readRate}%</span>
              </div>
              <ProgressBar pct={d.readRate} color={d.readRate > 80 ? C.success : d.readRate > 50 ? C.warning : C.danger} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

/* ═══════════ PAGE: Docs list ═══════════ */
const DocsPage = ({ onView }) => {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("全部");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [viewMode, setViewMode] = useState("table");

  const filtered = useMemo(() => DOCS.filter(d => {
    if (cat !== "全部" && d.category !== cat) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (search && !d.title.includes(search) && !d.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [search, cat, statusFilter]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>文档管理</h2><p style={{ color: C.textTertiary, margin: "4px 0 0", fontSize: 14 }}>管理企业流程与制度文件</p></div>
        <Btn primary icon={Icons.plus({ size: 15, color: C.white })} onClick={() => setShowNew(true)}>新建文档</Btn>
      </div>
      {/* filters */}
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Input placeholder="搜索文档编号或标题…" value={search} onChange={setSearch} icon={Icons.search({ size: 15, color: C.textTertiary })} style={{ width: 260 }} />
          <div style={{ display: "flex", gap: 4 }}>
            {CATEGORIES.map(c => (
              <span key={c} onClick={() => setCat(c)} style={{ padding: "5px 14px", borderRadius: 16, fontSize: 13, cursor: "pointer", background: cat === c ? C.primary : "#f5f5f5", color: cat === c ? C.white : C.textSecondary, fontWeight: cat === c ? 600 : 400, transition: "all .2s" }}>{c}</span>
            ))}
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "6px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13 }}>
            <option value="all">全部状态</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <span onClick={() => setViewMode("table")} style={{ padding: "5px 8px", borderRadius: 4, cursor: "pointer", background: viewMode === "table" ? C.primary + "18" : "transparent" }}>{Icons.list({ size: 16, color: viewMode === "table" ? C.primary : C.textTertiary })}</span>
            <span onClick={() => setViewMode("card")} style={{ padding: "5px 8px", borderRadius: 4, cursor: "pointer", background: viewMode === "card" ? C.primary + "18" : "transparent" }}>{Icons.grid({ size: 16, color: viewMode === "card" ? C.primary : C.textTertiary })}</span>
          </div>
        </div>
      </Card>
      {/* table view */}
      {viewMode === "table" ? (
        <Card style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["文档编号", "文档标题", "分类", "版本", "状态", "责任部门", "发布日期", "阅读率", "操作"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: C.textSecondary, fontSize: 13, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }} onClick={() => onView(d)}>
                  <td style={{ padding: "12px 16px", color: C.textTertiary, fontFamily: "monospace", fontSize: 13 }}>{d.code}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{d.title}</td>
                  <td style={{ padding: "12px 16px" }}><Badge color={C.primary} bg={C.tagBlue}>{d.category}</Badge></td>
                  <td style={{ padding: "12px 16px", color: C.textSecondary }}>v{d.version}</td>
                  <td style={{ padding: "12px 16px" }}><Badge {...STATUS_MAP[d.status]}>{STATUS_MAP[d.status].label}</Badge></td>
                  <td style={{ padding: "12px 16px", color: C.textSecondary }}>{d.dept}</td>
                  <td style={{ padding: "12px 16px", color: C.textSecondary, fontSize: 13 }}>{d.publishDate}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {d.readRate > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ProgressBar pct={d.readRate} color={d.readRate > 80 ? C.success : d.readRate > 50 ? C.warning : C.danger} />
                        <span style={{ fontSize: 12, color: C.textTertiary, minWidth: 32 }}>{d.readRate}%</span>
                      </div>
                    ) : <span style={{ color: C.textTertiary, fontSize: 12 }}>-</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Btn small ghost onClick={() => onView(d)}>查看</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: C.textTertiary }}>暂无匹配文档</div>}
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filtered.map(d => (
            <Card key={d.id} onClick={() => onView(d)} style={{ padding: 20, cursor: "pointer", transition: "box-shadow .2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <Badge {...STATUS_MAP[d.status]}>{STATUS_MAP[d.status].label}</Badge>
                <span style={{ fontSize: 12, color: C.textTertiary }}>v{d.version}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{d.title}</div>
              <div style={{ fontSize: 12, color: C.textTertiary, marginBottom: 12 }}>{d.code} · {d.dept}</div>
              {d.readRate > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ProgressBar pct={d.readRate} color={d.readRate > 80 ? C.success : C.warning} />
                  <span style={{ fontSize: 12, color: C.textTertiary }}>{d.readRate}%</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: C.textTertiary }}>
        <span>共 {filtered.length} 条记录</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2].map(p => <span key={p} style={{ padding: "4px 10px", borderRadius: 4, cursor: "pointer", background: p === 1 ? C.primary : "#f5f5f5", color: p === 1 ? C.white : C.textSecondary }}>{p}</span>)}
        </div>
      </div>
      <DocFormModal open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
};

/* ═══════════ PAGE: Doc detail ═══════════ */
const DetailPage = ({ doc, onBack }) => {
  const [tab, setTab] = useState(0);
  const [showPublish, setShowPublish] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [viewingVersion, setViewingVersion] = useState(null);
  if (!doc) return null;
  const st = STATUS_MAP[doc.status];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: "pointer", color: C.textSecondary }} onClick={onBack}>
        {Icons.arrowLeft({ size: 18 })} <span style={{ fontSize: 14 }}>返回文档列表</span>
      </div>
      {/* header */}
      <Card style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{doc.title}</h2>
              <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
            </div>
            <div style={{ display: "flex", gap: 20, fontSize: 13, color: C.textTertiary, flexWrap: "wrap" }}>
              <span>编号: {doc.code}</span>
              <span>版本: v{doc.version}</span>
              <span>分类: {doc.category}</span>
              <span>部门: {doc.dept}</span>
              <span>责任人: {doc.author}</span>
              <span>生效日: {doc.effectDate}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn ghost icon={Icons.edit({ size: 14, color: C.primary })} onClick={() => setShowEdit(true)}>编辑</Btn>
            {doc.status === "draft" || doc.status === "review" ? (
              <Btn primary icon={Icons.send({ size: 14, color: C.white })} onClick={() => setShowPublish(true)}>{doc.status === "draft" ? "提交审核" : "发布"}</Btn>
            ) : null}
            {doc.status === "published" && <Btn primary icon={Icons.send({ size: 14, color: C.white })} onClick={() => setShowPublish(true)}>发布新版</Btn>}
          </div>
        </div>
        {/* meta row */}
        <div style={{ display: "flex", gap: 32, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          <Stat label="浏览量" value={doc.views} />
          <Stat label="阅读确认率" value={`${doc.readRate}%`} color={doc.readRate > 80 ? C.success : C.warning} />
          <Stat label="版本数" value={VERSIONS.length} />
          <Stat label="可见范围" value={doc.scope.join(", ")} />
        </div>
      </Card>

      <Tab labels={["流程图", "版本历史", "变更日志", "阅读确认", "权限配置"]} active={tab} onChange={setTab} />

      {tab === 0 && (
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>流程节点图</span>
            <span style={{ fontSize: 12, color: C.textTertiary }}>点击节点查看详情</span>
          </div>
          {doc.hasFlow ? <FlowDiagram /> : <div style={{ padding: 60, textAlign: "center", color: C.textTertiary }}>该文档暂无关联流程图</div>}
        </Card>
      )}

      {tab === 1 && (
        <div>
          {!viewingVersion ? (
            <Card style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>版本历史</span>
                <Btn small ghost onClick={() => setShowDiff(true)} icon={Icons.copy({ size: 14, color: C.primary })}>版本对比</Btn>
              </div>
              <div style={{ position: "relative", paddingLeft: 24 }}>
                <div style={{ position: "absolute", left: 7, top: 4, bottom: 4, width: 2, background: C.border }} />
                {VERSIONS.map((v, i) => {
                  const [hov, setHov] = useState(false);
                  return (
                    <div key={i} style={{ position: "relative", paddingBottom: 24 }}>
                      <div style={{ position: "absolute", left: -20, top: 4, width: 12, height: 12, borderRadius: "50%", background: i === 0 ? C.primary : C.border, border: `2px solid ${C.white}` }} />
                      <div
                        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                        onClick={() => setViewingVersion(v)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 14px", borderRadius: 8, cursor: "pointer", background: hov ? "#f6f8fa" : "transparent", border: `1px solid ${hov ? C.border : "transparent"}`, transition: "all .2s" }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>v{v.ver}</span>
                            <Badge color={i === 0 ? C.success : C.textTertiary} bg={i === 0 ? C.tagGreen : "#f5f5f5"}>{i === 0 ? "当前版本" : "已归档"}</Badge>
                          </div>
                          <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>{v.change}</div>
                          <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 6, display: "flex", gap: 16 }}>
                            <span>共 {v.chapters?.length || 0} 章</span>
                            <span>{v.author}</span>
                            <span>{v.date}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: hov ? C.primary : C.textTertiary, fontSize: 13, whiteSpace: "nowrap", paddingTop: 4 }}>
                          {Icons.eye({ size: 14, color: hov ? C.primary : C.textTertiary })}
                          <span>查看全文</span>
                          {Icons.chevRight({ size: 14, color: hov ? C.primary : C.textTertiary })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            /* ── Version detail view ── */
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer", color: C.textSecondary }} onClick={() => setViewingVersion(null)}>
                {Icons.arrowLeft({ size: 18 })} <span style={{ fontSize: 14 }}>返回版本列表</span>
              </div>
              <Card style={{ padding: 24 }}>
                {/* version header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 20, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{doc.title}</h3>
                      <Badge color={viewingVersion === VERSIONS[0] ? C.success : C.textTertiary} bg={viewingVersion === VERSIONS[0] ? C.tagGreen : "#f5f5f5"}>
                        {viewingVersion === VERSIONS[0] ? "当前版本" : "已归档"}
                      </Badge>
                    </div>
                    <div style={{ display: "flex", gap: 20, fontSize: 13, color: C.textTertiary }}>
                      <span>版本: v{viewingVersion.ver}</span>
                      <span>发布日期: {viewingVersion.date}</span>
                      <span>编辑人: {viewingVersion.author}</span>
                      <span>变更说明: {viewingVersion.change}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn small ghost icon={Icons.download({ size: 14, color: C.primary })}>导出 PDF</Btn>
                    {viewingVersion !== VERSIONS[0] && (
                      <Btn small ghost icon={Icons.copy({ size: 14, color: C.primary })} onClick={() => setShowDiff(true)}>与当前版本对比</Btn>
                    )}
                  </div>
                </div>
                {/* table of contents */}
                <div style={{ display: "flex", gap: 24 }}>
                  <div style={{ width: 200, flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, marginBottom: 10, padding: "0 8px" }}>目录</div>
                    {viewingVersion.chapters?.map((ch, ci) => (
                      <div key={ci}
                        onClick={() => { const el = document.getElementById(`chapter-${ci}`); el?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                        style={{ padding: "8px 12px", fontSize: 13, color: C.textSecondary, cursor: "pointer", borderLeft: `2px solid ${C.border}`, borderRadius: 0, marginBottom: 2, transition: "all .15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderLeftColor = C.primary; e.currentTarget.style.color = C.primary; e.currentTarget.style.background = "#f0f5ff"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderLeftColor = C.border; e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = "transparent"; }}
                      >
                        {ch.title}
                      </div>
                    ))}
                  </div>
                  {/* chapter content */}
                  <div style={{ flex: 1, borderLeft: `1px solid ${C.border}`, paddingLeft: 24 }}>
                    {viewingVersion.chapters?.map((ch, ci) => (
                      <div key={ci} id={`chapter-${ci}`} style={{ marginBottom: 28 }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, color: C.textPrimary, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>{ch.title}</h4>
                        {ch.content.split("\n").map((line, li) => (
                          <p key={li} style={{ fontSize: 14, lineHeight: 1.9, color: C.textSecondary, margin: "0 0 6px", paddingLeft: line.match(/^\d/) ? 0 : 16 }}>{line}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === 2 && (
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>变更日志</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["时间", "操作人", "操作类型", "详情"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOG.map((l, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 16px", color: C.textTertiary, fontFamily: "monospace", fontSize: 12 }}>{l.time}</td>
                  <td style={{ padding: "10px 16px" }}>{l.user}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <Badge color={l.action.includes("发布") ? C.success : l.action.includes("审批") ? C.primary : C.warning} bg={l.action.includes("发布") ? C.tagGreen : l.action.includes("审批") ? C.tagBlue : C.tagOrange}>{l.action}</Badge>
                  </td>
                  <td style={{ padding: "10px 16px", color: C.textSecondary }}>{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 3 && (
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>阅读确认跟踪</span>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: C.textTertiary }}>已确认 {READ_CONFIRM.filter(r => r.confirmed).length}/{READ_CONFIRM.length}</span>
              <Btn small ghost icon={Icons.bell({ size: 14, color: C.primary })}>催办提醒</Btn>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1, padding: 16, background: C.tagGreen, borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.success }}>{READ_CONFIRM.filter(r => r.confirmed).length}</div>
              <div style={{ fontSize: 12, color: C.textSecondary }}>已确认</div>
            </div>
            <div style={{ flex: 1, padding: 16, background: C.tagRed, borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.danger }}>{READ_CONFIRM.filter(r => !r.confirmed).length}</div>
              <div style={{ fontSize: 12, color: C.textSecondary }}>未确认</div>
            </div>
            <div style={{ flex: 1, padding: 16, background: C.tagBlue, borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.primary }}>{Math.round(READ_CONFIRM.filter(r => r.confirmed).length / READ_CONFIRM.length * 100)}%</div>
              <div style={{ fontSize: 12, color: C.textSecondary }}>确认率</div>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["姓名", "部门", "阅读时间", "状态"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {READ_CONFIRM.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 16px", fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: "10px 16px", color: C.textSecondary }}>{r.dept}</td>
                  <td style={{ padding: "10px 16px", color: C.textTertiary, fontSize: 12 }}>{r.readTime}</td>
                  <td style={{ padding: "10px 16px" }}>
                    {r.confirmed ? <Badge color={C.success} bg={C.tagGreen}>已确认</Badge> : <Badge color={C.danger} bg={C.tagRed}>未确认</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 4 && (
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>权限与可见范围配置</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: C.textSecondary }}>可见范围</div>
              <div style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                {["全公司", "管理层", "人力资源部", "财务部", "IT部"].map((s, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 14, cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked={i === 0} /> {s}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: C.textSecondary }}>操作权限</div>
              <div style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                {[
                  { role: "文档管理员", perms: "编辑、发布、归档" },
                  { role: "部门主管", perms: "审核、查看" },
                  { role: "普通员工", perms: "查看、确认阅读" },
                ].map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none", fontSize: 13 }}>
                    <span style={{ fontWeight: 500 }}>{p.role}</span>
                    <span style={{ color: C.textTertiary }}>{p.perms}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <PublishModal open={showPublish} onClose={() => setShowPublish(false)} doc={doc} />
      <DiffModal open={showDiff} onClose={() => setShowDiff(false)} />
      <DocFormModal open={showEdit} onClose={() => setShowEdit(false)} doc={doc} />
    </div>
  );
};

/* ═══════════ PAGE: Audit Log ═══════════ */
const AuditPage = () => (
  <div>
    <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700 }}>变更日志</h2>
    <Card style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Input placeholder="搜索操作人或详情…" value="" onChange={() => {}} icon={Icons.search({ size: 15, color: C.textTertiary })} style={{ width: 260 }} />
        <select style={{ padding: "6px 12px", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13 }}>
          <option>全部操作类型</option><option>发布</option><option>审批</option><option>编辑</option><option>创建</option>
        </select>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#fafafa" }}>
            {["时间", "关联文档", "操作人", "操作", "详情"].map(h => (
              <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: C.textSecondary, borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...AUDIT_LOG, ...AUDIT_LOG.slice(0, 3).map((l, i) => ({ ...l, time: l.time.replace("2025-12", "2025-11"), detail: l.detail + " (差旅费用)" }))].map((l, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
              <td style={{ padding: "10px 16px", color: C.textTertiary, fontFamily: "monospace", fontSize: 12 }}>{l.time}</td>
              <td style={{ padding: "10px 16px", color: C.primary, fontWeight: 500 }}>HR-001</td>
              <td style={{ padding: "10px 16px" }}>{l.user}</td>
              <td style={{ padding: "10px 16px" }}>
                <Badge color={l.action.includes("发布") ? C.success : l.action.includes("审批") ? C.primary : C.warning} bg={l.action.includes("发布") ? C.tagGreen : l.action.includes("审批") ? C.tagBlue : C.tagOrange}>{l.action}</Badge>
              </td>
              <td style={{ padding: "10px 16px", color: C.textSecondary }}>{l.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

/* ═══════════ PAGE: Read Confirm ═══════════ */
const ReadPage = () => (
  <div>
    <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700 }}>阅读确认管理</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
      {DOCS.filter(d => d.status === "published").map(d => (
        <Card key={d.id} style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>{d.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <ProgressBar pct={d.readRate} color={d.readRate > 80 ? C.success : C.warning} />
            <span style={{ fontWeight: 600, color: d.readRate > 80 ? C.success : C.warning, fontSize: 14 }}>{d.readRate}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textTertiary }}>
            <span>范围: {d.scope.join(", ")}</span>
            <span>浏览 {d.views} 次</span>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

/* ═══════════ PAGE: Permissions ═══════════ */
const PermsPage = () => {
  const roles = [
    { name: "超级管理员", users: 2, perms: ["创建", "编辑", "发布", "归档", "删除", "权限管理"] },
    { name: "文档管理员", users: 5, perms: ["创建", "编辑", "发布", "归档"] },
    { name: "部门审核人", users: 12, perms: ["审核", "查看", "评论"] },
    { name: "普通员工", users: 156, perms: ["查看", "阅读确认"] },
  ];
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700 }}>权限设置</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>角色管理</div>
          {roles.map((r, i) => (
            <div key={i} style={{ padding: 14, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</span>
                <span style={{ fontSize: 12, color: C.textTertiary }}>{r.users} 人</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {r.perms.map(p => <Badge key={p} color={C.primary} bg={C.tagBlue}>{p}</Badge>)}
              </div>
            </div>
          ))}
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>文档级权限</div>
          <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 16 }}>支持对单个文档设置精细化权限控制</div>
          <div style={{ padding: 16, background: "#fafafa", borderRadius: 8, marginBottom: 12 }}>
            <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 14 }}>可见范围模式</div>
            {["全公司公开", "指定部门可见", "指定人员可见", "仅管理层可见"].map((m, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 13, cursor: "pointer" }}>
                <input type="radio" name="scope" defaultChecked={i === 0} /> {m}
              </label>
            ))}
          </div>
          <div style={{ padding: 16, background: "#fafafa", borderRadius: 8 }}>
            <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 14 }}>审批流配置</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textSecondary }}>
              <Badge color={C.primary} bg={C.tagBlue}>起草</Badge> → <Badge color={C.warning} bg={C.tagOrange}>初审</Badge> → <Badge color={C.success} bg={C.tagGreen}>终审</Badge> → <Badge color={C.success} bg={C.tagGreen}>发布</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ═══════════ PAGE: Flows ═══════════ */
const FlowsPage = ({ setNav, setDetailDoc }) => (
  <div>
    <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700 }}>流程管理</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      {DOCS.filter(d => d.hasFlow).map(d => (
        <Card key={d.id} style={{ padding: 20, cursor: "pointer" }} onClick={() => { setDetailDoc(d); setNav("detail"); }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{d.title}</span>
            <Badge {...STATUS_MAP[d.status]}>{STATUS_MAP[d.status].label}</Badge>
          </div>
          <div style={{ fontSize: 13, color: C.textTertiary, marginBottom: 12 }}>{d.code} · {d.dept} · v{d.version}</div>
          <div style={{ padding: 12, background: "#fafbfc", borderRadius: 8, border: `1px dashed ${C.border}`, textAlign: "center", fontSize: 13, color: C.textTertiary }}>
            {Icons.flow({ size: 20, color: C.textTertiary })}
            <div style={{ marginTop: 4 }}>点击查看流程图</div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

/* ═══════════ ROOT ═══════════ */
export default function App() {
  const [nav, setNav] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [detailDoc, setDetailDoc] = useState(null);

  const viewDoc = (d) => { setDetailDoc(d); setNav("detail"); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      <Sidebar nav={nav === "detail" ? "docs" : nav} setNav={setNav} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, padding: 28, overflow: "auto", maxWidth: 1200 }}>
        {/* top bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 24, gap: 16 }}>
          <div style={{ position: "relative" }}>
            {Icons.bell({ size: 20, color: C.textTertiary })}
            <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: C.danger }} />
          </div>
          <span style={{ fontSize: 13, color: C.textSecondary }}>2026-02-06</span>
        </div>
        {nav === "dashboard" && <DashboardPage setNav={setNav} setDetailDoc={setDetailDoc} />}
        {nav === "docs" && <DocsPage onView={viewDoc} />}
        {nav === "detail" && <DetailPage doc={detailDoc} onBack={() => setNav("docs")} />}
        {nav === "flows" && <FlowsPage setNav={setNav} setDetailDoc={setDetailDoc} />}
        {nav === "audit" && <AuditPage />}
        {nav === "read" && <ReadPage />}
        {nav === "perms" && <PermsPage />}
      </div>
    </div>
  );
}

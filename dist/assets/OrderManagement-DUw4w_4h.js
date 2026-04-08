import{c as ee,r as p,b as te,s as b,j as e,d as se,E as ae,m as ie,C as D,e as re,T as ne,P as ce,f as le,t as w,h as de}from"./index-DVTV6Lpa.js";import{S as oe}from"./square-pen-DKxONU2a.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe=[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]],me=ee("printer",pe),h=d=>`CLO-${String(d).replace("ORDER-","").slice(-4).padStart(4,"0")}`,ue=async(d,y)=>{await b.from("payment_logs").insert({order_id:d,status:y,created_at:new Date().toISOString()})};function he(){const[d,y]=p.useState([]),[k,W]=p.useState([]),[f,$]=p.useState(""),[_,P]=p.useState("all"),[S,R]=p.useState("all"),[a,C]=p.useState(null),[O,q]=p.useState({}),[A,L]=p.useState(""),l=p.useMemo(()=>te(),[]),j=async()=>{var m,g,c,v;const{data:t,error:i}=await b.from("orders").select("*");if(console.log("ORDERS FROM DB:",t),console.log("FIRST ORDER SAMPLE:",t==null?void 0:t[0]),console.log("EMAIL FIELDS CHECK:",{customer_email:(m=t==null?void 0:t[0])==null?void 0:m.customer_email,email:(g=t==null?void 0:t[0])==null?void 0:g.email,formData:(c=t==null?void 0:t[0])==null?void 0:c.formData,shipping_details:(v=t==null?void 0:t[0])==null?void 0:v.shipping_details}),i){console.error("Error fetching orders:",i);return}const r=(t||[]).map(s=>{var u,x,N,z,U,B,H,J,Q,K,V;return{...s,id:s.order_code||s.id,customerName:s.customer_name||s.customerName||s.name||s.full_name||((u=s.formData)==null?void 0:u.fullName)||((x=s.formData)==null?void 0:x.name)||((N=s.shipping_details)==null?void 0:N.name)||"Customer",customerEmail:s.customer_email||s.customerEmail||s.email||s.user_email||((z=s.formData)==null?void 0:z.email)||((U=s.formData)==null?void 0:U.customerEmail)||((B=s.shipping_details)==null?void 0:B.email)||((H=s.shipping_details)==null?void 0:H.customerEmail)||((J=s.billing_details)==null?void 0:J.email)||(typeof s.formData=="string"?(()=>{try{const n=JSON.parse(s.formData);return(n==null?void 0:n.email)||(n==null?void 0:n.customerEmail)||null}catch{return null}})():null)||"No Email",date:s.created_at,shippingAddress:s.address||s.shipping_address||((Q=s.formData)==null?void 0:Q.address)||((K=s.shipping_details)==null?void 0:K.address)||"",items:Array.isArray(s.items)?s.items.map(n=>({...n,image:n.image||(Array.isArray(n.images)?n.images[0]:n.images)||null})):[],total:Number(s.total||0),subtotal:s.subtotal!==void 0&&s.subtotal!==null?Number(s.subtotal):Number(s.total||0)+Number(s.discount_amount||0)-Number(s.shipping_cost||0),discount_amount:Number(s.discount_amount||s.discount||s.promo_discount||0),promo_code:s.promo_code||s.coupon_code||s.discount_code||(typeof s.formData=="string"?(()=>{try{const n=JSON.parse(s.formData);return(n==null?void 0:n.promo_code)||(n==null?void 0:n.coupon)||null}catch{return null}})():((V=s.formData)==null?void 0:V.promo_code)||null),shipping_cost:Number(s.shipping_cost??0),source:s.source||"website",paymentMethod:s.payment_method||"cod",paymentStatus:s.payment_status==="failed"?"failed":s.payment_status||"pending",orderCode:s.order_code}});console.log("CUSTOM ORDERS CHECK:",r.filter(s=>s.is_custom));const o=r.map(s=>{let u=Number(s.shipping_cost??0);const x=Number(s.discount_amount||0),N=Number(s.total||0),z=s.subtotal!==void 0&&s.subtotal!==null?Number(s.subtotal):N+x-u;return{...s,subtotal:z,shipping_cost:u,discount_amount:x,total:N}});y(o.filter(s=>{var u,x;return s.is_custom?s.approved_price||((u=s.custom_designs)==null?void 0:u.approved_price)||s.total||((x=s.items)==null?void 0:x.length):!0}))};p.useEffect(()=>{j();const t=()=>{j()};return window.addEventListener("ordersUpdated",t),()=>{window.removeEventListener("ordersUpdated",t)}},[]),p.useEffect(()=>{const t=b.channel("orders-realtime").on("postgres_changes",{event:"*",schema:"public",table:"orders"},i=>{console.log("REALTIME UPDATE:",i),j()}).subscribe();return()=>{b.removeChannel(t)}},[]),p.useEffect(()=>{let t=d;f&&(t=t.filter(i=>String(i.id||"").toLowerCase().includes(f.toLowerCase())||String(i.customerName||"").toLowerCase().includes(f.toLowerCase())||String(i.customerEmail||"").toLowerCase().includes(f.toLowerCase()))),_!=="all"&&(t=t.filter(i=>i.status===_)),S!=="all"&&(t=t.filter(i=>i.source===S)),W(t)},[l==null?void 0:l.branch,d,f,_,S]);const E=async(t,i)=>{const r=/^[0-9a-fA-F-]{36}$/.test(t),o=b.from("orders").update({status:i}),{error:m}=r?await o.eq("id",t):await o.eq("order_code",t);m?(console.error(m),w.error("Failed to update status")):(y(g=>g.map(c=>c.orderCode===t||c.id===t?{...c,status:i,paymentStatus:c.paymentMethod==="cod"&&i==="delivered"?"paid":c.paymentStatus}:c)),(i==="processing"||i==="delivered")&&await ue(t,"updated"),await j())},M=t=>{var i;C(t),q(Object.fromEntries(t.items.map(r=>[String(r.id),r.adminRemark??""]))),L(((i=t.exchange_request)==null?void 0:i.adminMessage)??"")},T=t=>{const i=String(t.shippingAddress||"").replace(/,\s*(\d+),\1/g,", $1"),r=localStorage.getItem("printerSize")||"80",o=r==="58"?"58mm":"80mm",m=r==="58"?"100mm":"120mm",g=h(t.id),c=window.open("","_blank","width=900,height=700");if(!c){w.error("Unable to open the print window.");return}c.document.write(`
<html>
  <head>
    <title>Pro Label v3 ${h(t.id)}</title>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
    <link rel="preload" as="image" href="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${h(t.id)}" />
    <style>
      @page {
        size: ${o} ${m};
        margin: 0;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
      }
      .sticker {
        width: ${o};
        height: ${m};
        border: 2px solid #000;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-right: 90px; /* space for QR */
      }
      .logo {
        width: 42px;
        height: 42px;
      }
      .brand {
        font-size: 22px;
        font-weight: bold;
        letter-spacing: 3px;
      }
      .tagline {
        font-size: 10px;
        letter-spacing: 2px;
      }
      .order-id {
        font-size: 16px;
        font-weight: bold;
        margin-top: 6px;
      }
      .datetime {
        font-size: 10px;
        color: #555;
      }
      .divider {
        border-top: 1px dashed #aaa;
        margin: 8px 0;
      }
      .section {
        font-size: 12px;
      }
      .label {
        font-size: 10px;
        color: #777;
        text-transform: uppercase;
      }
      .value {
        font-weight: 600;
      }
      .delivery {
        border: 1px dashed #000;
        padding: 6px;
        font-size: 11px;
      }
      .items {
        font-size: 11px;
      }
      .total {
        font-size: 15px;
        font-weight: bold;
      }
      .barcode {
        text-align: center;
        font-size: 10px;
        letter-spacing: 2px;
        word-break: break-all;
        overflow: hidden;
      }
      .footer {
        font-size: 10px;
        text-align: center;
        letter-spacing: 2px;
      }
      .qr-top {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 75px;
        height: 75px;
      }
    </style>
  </head>
  <body>
    <div class="sticker">
      <div class="header">
        <img src="${window.location.origin}/clo-sitelogo.svg" class="logo" />
        <div>
          <div class="brand">CLO</div>
          <div class="tagline">BUILT DIFFERENT</div>
        </div>
      </div>
      <div class="qr-top">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${g}" />
      </div>
      <div>
        <div class="order-id">#${h(t.id)}</div>
        <div class="datetime">${new Date(t.date).toLocaleString()}</div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="label">Customer</div>
        <div class="value">${t.customerName}</div>
      </div>

      <div class="section">
        <div class="label">Address</div>
        <div class="value">${i}</div>
      </div>

      <div class="divider"></div>

      <div class="delivery">
        <div><strong>Type:</strong> ${t.paymentMethod==="cod"?"COD":"Prepaid"}</div>
      </div>

      <div class="divider"></div>

      <div class="section items">
        ${t.items.map(v=>`<div>${v.name} × ${v.quantity}</div>`).join("")}
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="label">Subtotal</div>
        <div class="value">
          ${(()=>{const v=Number(t.total||0),s=Number(t.discount_amount||0),u=Number(t.shipping_cost||0);return`NPR ${(t.subtotal!==void 0&&t.subtotal!==null?Number(t.subtotal):v+s-u).toLocaleString()}`})()}
        </div>
      </div>

      ${t.discount_amount?`
      <div class="section" style="color: green;">
        <div class="label">Discount ${t.promo_code?`(${t.promo_code})`:""}</div>
        <div class="value">
          - NPR ${Number(t.discount_amount).toLocaleString()}
        </div>
      </div>
      `:""}

      ${t.shipping_cost?`
      <div class="section">
        <div class="label">Shipping</div>
        <div class="value">
          NPR ${Number(t.shipping_cost||0).toLocaleString()}
        </div>
      </div>
      `:""}

      <div class="divider"></div>

      <div class="total">
        NPR ${Number(t.total||0).toLocaleString()}
      </div>

      ${t.promo_code?`
      <div style="font-size:10px; text-align:center; color:#666;">
        Promo Applied: ${t.promo_code}
      </div>
      `:""}

      <div class="barcode">
        <svg id="barcode"></svg>
      </div>

      <div class="footer">
        CLO • clo.com
      </div>
    </div>
    <script>
      JsBarcode("#barcode", "${h(t.id)}", {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false
      });
    <\/script>
  </body>
</html>
    `),c.document.close(),c.onload=()=>{setTimeout(()=>{c.focus(),c.print()},500)},l&&de({adminId:l.id,adminName:l.name,adminEmail:l.email,branch:l.branch,action:"printed",entityType:"order",entityName:t.id,details:"Printed order summary."})},X=async()=>{if(!a)return;const t=a.items.map(r=>({...r,adminRemark:(O[String(r.id)]??"").trim()})),{error:i}=await b.from("orders").update({items:t}).eq("order_code",a.id);if(i){console.error(i),w.error("Failed to save remarks");return}await j(),w.success("Order remarks saved")},F=async(t,i)=>{const r=d.find(g=>g.id===t);if(!r||!r.exchange_request)return;const o={...r.exchange_request,status:i,adminMessage:A.trim(),reviewedAt:new Date().toISOString(),reviewedBy:(l==null?void 0:l.name)||"Admin"},{error:m}=await b.from("orders").update({status:i==="approved"?"exchange_requested":"delivered",exchange_request:o}).eq("order_code",t);if(m){console.error(m),w.error("Failed to update exchange request");return}await j(),C(null),w.success("Exchange updated")},G=t=>{switch(t){case"pending":return e.jsx(le,{size:16,className:"text-yellow-500"});case"processing":return e.jsx(ce,{size:16,className:"text-blue-500"});case"shipped":return e.jsx(ne,{size:16,className:"text-purple-500"});case"delivered":return e.jsx(re,{size:16,className:"text-green-500"});case"cancelled":return e.jsx(D,{size:16,className:"text-red-500"});case"returned":return e.jsx(D,{size:16,className:"text-orange-500"});case"exchange_requested":return e.jsx(oe,{size:16,className:"text-cyan-600"})}},Y=t=>{switch(t){case"pending":return"text-yellow-600 bg-yellow-100";case"processing":return"text-blue-600 bg-blue-100";case"shipped":return"text-purple-600 bg-purple-100";case"delivered":return"text-green-600 bg-green-100";case"cancelled":return"text-red-600 bg-red-100";case"returned":return"text-orange-600 bg-orange-100";case"exchange_requested":return"text-cyan-700 bg-cyan-100"}},Z=t=>{switch(t){case"website":return"🌐";case"instagram":return"📷";case"facebook":return"👥";case"tiktok":return"🎵"}},I=t=>new Date(t).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"});return e.jsxs("div",{className:"space-y-6 text-gray-200",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("h2",{className:"text-2xl font-bold tracking-widest uppercase",children:"Order Management"}),e.jsx("div",{className:"flex items-center gap-4",children:e.jsxs("div",{className:"text-sm text-gray-600 tracking-wider",children:[k.length," of ",d.length," orders"]})})]}),l&&l.branch!=="Head Office"?e.jsxs("p",{className:"text-sm text-gray-600",children:["Showing orders assigned to ",l.branch,"."]}):null,e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-5 gap-4",children:[{label:"Total",value:d.length},{label:"Pending",value:d.filter(t=>t.status==="pending").length},{label:"Processing",value:d.filter(t=>t.status==="processing").length},{label:"Shipped",value:d.filter(t=>t.status==="shipped").length},{label:"Delivered",value:d.filter(t=>t.status==="delivered").length}].map(t=>e.jsxs("div",{className:"bg-zinc-900 p-4 rounded shadow-sm text-center border border-zinc-800",children:[e.jsx("p",{className:"text-xs uppercase text-gray-400 tracking-wider",children:t.label}),e.jsx("p",{className:"text-xl font-bold",children:t.value})]},t.label))}),e.jsx("div",{className:"bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-800",children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[e.jsxs("div",{className:"relative",children:[e.jsx(se,{size:16,className:"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"}),e.jsx("input",{type:"text",placeholder:"Search by Order ID, Name, Email...",value:f,onChange:t=>$(t.target.value),className:"w-full pl-10 pr-4 py-2 border border-zinc-700 bg-zinc-950 text-white focus:outline-none focus:border-white tracking-wider"})]}),e.jsxs("select",{value:_,onChange:t=>P(t.target.value),className:"px-4 py-2 border border-zinc-700 bg-zinc-950 text-white focus:outline-none focus:border-white tracking-wider",children:[e.jsx("option",{value:"all",children:"All Statuses"}),e.jsx("option",{value:"pending",children:"Pending"}),e.jsx("option",{value:"processing",children:"Processing"}),e.jsx("option",{value:"shipped",children:"Shipped"}),e.jsx("option",{value:"delivered",children:"Delivered"}),e.jsx("option",{value:"cancelled",children:"Cancelled"}),e.jsx("option",{value:"returned",children:"Returned"}),e.jsx("option",{value:"exchange_requested",children:"Exchange Request"})]}),e.jsxs("select",{value:S,onChange:t=>R(t.target.value),className:"px-4 py-2 border border-zinc-700 bg-zinc-950 text-white focus:outline-none focus:border-white tracking-wider",children:[e.jsx("option",{value:"all",children:"All Sources"}),e.jsx("option",{value:"website",children:"Website"}),e.jsx("option",{value:"instagram",children:"Instagram"}),e.jsx("option",{value:"facebook",children:"Facebook"}),e.jsx("option",{value:"tiktok",children:"TikTok"})]}),e.jsx("button",{onClick:()=>{$(""),P("all"),R("all")},className:"px-4 py-2 bg-zinc-800 text-gray-200 hover:bg-zinc-700 transition-colors tracking-wider uppercase text-sm",children:"Clear Filters"})]})}),e.jsx("div",{className:"bg-zinc-900 rounded-lg shadow-sm overflow-hidden border border-zinc-800",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full",children:[e.jsx("thead",{className:"bg-zinc-800",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider",children:"Order"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider",children:"Customer"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider",children:"Source"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider",children:"Date"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider",children:"Status"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider",children:"Payment"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider",children:"Total"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider",children:"Actions"})]})}),e.jsxs("tbody",{className:"bg-zinc-900 divide-y divide-zinc-800",children:[k.map(t=>e.jsxs("tr",{className:"hover:bg-zinc-800 cursor-pointer",onClick:()=>M(t),children:[e.jsxs("td",{className:"px-6 py-4 whitespace-nowrap",children:[e.jsxs("div",{className:"text-sm font-semibold text-white tracking-wider",children:["#",h(t.id)]}),e.jsxs("div",{className:"text-sm text-gray-400",children:[t.items.length," item",t.items.length!==1?"s":""]})]}),e.jsxs("td",{className:"px-6 py-4 whitespace-nowrap",children:[e.jsx("div",{className:"text-sm font-medium text-white tracking-wider",children:t.customerName}),e.jsx("div",{className:"text-sm text-gray-400 tracking-wider",children:t.customerEmail})]}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-lg",children:Z(t.source)}),e.jsx("span",{className:"text-sm text-white capitalize tracking-wider",children:t.source})]})}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-white tracking-wider",children:I(t.date)}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:e.jsxs("div",{className:"flex items-center gap-2",children:[G(t.status),e.jsxs("select",{value:t.status,onClick:i=>i.stopPropagation(),onChange:i=>{i.stopPropagation(),E(t.orderCode||t.id,i.target.value)},className:`text-xs px-2 py-1 rounded-full tracking-wider uppercase font-medium ${Y(t.status)}`,children:[e.jsx("option",{value:"pending",children:"Pending"}),e.jsx("option",{value:"processing",children:"Processing"}),e.jsx("option",{value:"shipped",children:"Shipped"}),e.jsx("option",{value:"delivered",children:"Delivered"}),e.jsx("option",{value:"cancelled",children:"Cancelled"}),e.jsx("option",{value:"returned",children:"Returned"}),e.jsx("option",{value:"exchange_requested",children:"Exchange Request"})]})]})}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap",children:e.jsxs("div",{className:"text-sm tracking-wider space-y-1",children:[e.jsx("span",{className:"font-medium capitalize",children:t.paymentMethod}),e.jsx("div",{className:"text-xs",children:t.paymentMethod==="esewa"?e.jsx("span",{className:`px-2 py-1 rounded-full ${t.paymentStatus==="paid"?"bg-green-100 text-green-700":t.paymentStatus==="failed"?"bg-yellow-100 text-yellow-800":"bg-red-100 text-red-600"}`,children:t.paymentStatus==="paid"?"Paid":t.paymentStatus==="failed"?"Failed":"Unpaid"}):t.paymentMethod==="cod"?e.jsx("span",{className:`px-2 py-1 rounded-full ${t.status==="delivered"?"bg-green-100 text-green-700":"bg-yellow-100 text-yellow-700"}`,children:t.status==="delivered"?"Payment Received":"Pending"}):null})]})}),e.jsxs("td",{className:"px-6 py-4 whitespace-nowrap text-sm text-white tracking-wider",children:["NPR ",t.total.toLocaleString()]}),e.jsx("td",{className:"px-6 py-4 whitespace-nowrap text-sm font-medium",children:e.jsxs("div",{className:"flex items-center gap-2 flex-wrap",onClick:i=>i.stopPropagation(),children:[e.jsx("button",{onClick:()=>M(t),className:"text-blue-400 hover:text-blue-300 transition-colors",title:"Preview Order",children:e.jsx(ae,{size:18})}),e.jsx("button",{onClick:()=>T(t),className:"text-gray-400 hover:text-white transition-colors",title:"Print Order",children:e.jsx(me,{size:18})}),e.jsx("button",{onClick:()=>E(t.orderCode||t.id,"shipped"),className:"text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded",children:"Ship"}),e.jsx("button",{onClick:()=>E(t.orderCode||t.id,"delivered"),className:"text-xs px-2 py-1 bg-green-100 text-green-700 rounded",children:"Deliver"})]})})]},`${h(t.id)}-${t.date}`)),k.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:8,className:"text-center py-10 text-gray-400",children:"No orders found"})})]})]})})}),a&&e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",children:e.jsxs(ie.div,{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},className:"bg-zinc-900 text-white rounded-lg shadow-xl border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto",children:[e.jsx("div",{className:"p-6 border-b border-zinc-800",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h3",{className:"text-xl font-semibold tracking-widest uppercase",children:["Order ",h(a.id)]}),e.jsx("button",{onClick:()=>C(null),className:"text-gray-400 hover:text-gray-200",children:e.jsx(D,{size:24})})]})}),e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-2 tracking-wider uppercase",children:"Customer"}),e.jsx("p",{className:"text-sm tracking-wider",children:a.customerName}),e.jsx("p",{className:"text-sm text-gray-400 tracking-wider",children:a.customerEmail})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-2 tracking-wider uppercase",children:"Order Details"}),e.jsxs("p",{className:"text-sm tracking-wider",children:["Date: ",I(a.date)]}),e.jsxs("p",{className:"text-sm tracking-wider",children:["Source: ",a.source]}),e.jsxs("p",{className:"text-sm tracking-wider",children:["Payment: ",a.paymentMethod]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-2 tracking-wider uppercase",children:"Shipping Address"}),e.jsx("p",{className:"text-sm tracking-wider",children:a.shippingAddress}),a.trackingNumber&&e.jsxs("p",{className:"text-sm text-gray-400 tracking-wider mt-1",children:["Tracking: ",a.trackingNumber]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-4 tracking-wider uppercase",children:"Items"}),e.jsx("div",{className:"space-y-3",children:a.items.map((t,i)=>e.jsxs("div",{className:"py-4 border-b border-zinc-800 flex gap-4 items-start",children:[e.jsx("div",{className:"w-20 h-20 bg-zinc-800 flex items-center justify-center overflow-hidden rounded",children:t.image||t.images?e.jsx("img",{src:t.image||(Array.isArray(t.images)?t.images[0]:t.images)||"/placeholder.png",alt:t.name,className:"w-full h-full object-cover"}):e.jsx("span",{className:"text-xs text-gray-400",children:"No Image"})}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"font-medium tracking-wider",children:t.name}),e.jsxs("p",{className:"text-sm text-gray-400 tracking-wider",children:["Qty: ",t.quantity]})]}),e.jsxs("p",{className:"font-medium tracking-wider",children:["NPR ",Number(t.price||0).toLocaleString()]})]}),e.jsxs("div",{className:"mt-3",children:[e.jsx("label",{className:"mb-2 block text-xs uppercase tracking-wider text-gray-400",children:"Admin Remark"}),e.jsx("textarea",{value:O[String(t.id)]??"",onChange:r=>q(o=>({...o,[String(t.id)]:r.target.value})),rows:2,className:"w-full rounded border border-zinc-700 bg-zinc-950 text-white px-3 py-2 text-sm tracking-wider focus:border-white focus:outline-none",placeholder:"Add notes for this item"})]})]})]},`${t.id||t.name}-${i}`))}),e.jsxs("div",{className:"pt-4 border-t border-zinc-800 space-y-2",children:[e.jsxs("div",{className:"flex justify-between text-sm tracking-wider",children:[e.jsx("span",{children:"Payment Method"}),e.jsx("span",{className:"uppercase font-medium",children:a.paymentMethod})]}),e.jsxs("div",{className:"flex justify-between text-sm tracking-wider",children:[e.jsx("span",{children:"Payment Status"}),e.jsx("span",{className:"uppercase font-medium",children:a.paymentStatus})]}),e.jsxs("div",{className:"flex justify-between text-sm tracking-wider",children:[e.jsx("span",{children:"Subtotal"}),e.jsx("span",{children:(()=>{const t=Number(a.total||0),i=Number(a.discount_amount||0),r=Number(a.shipping_cost||0);return`NPR ${(a.subtotal!==void 0&&a.subtotal!==null?Number(a.subtotal):t+i-r).toLocaleString()}`})()})]}),a.discount_amount?e.jsxs("div",{className:"flex justify-between text-sm tracking-wider text-green-600",children:[e.jsxs("span",{children:["Discount ",a.promo_code?`(${a.promo_code})`:""]}),e.jsxs("span",{children:["- NPR ",Number(a.discount_amount||0).toLocaleString()]})]}):null,a.shipping_cost!==void 0?e.jsxs("div",{className:"flex justify-between text-sm tracking-wider",children:[e.jsx("span",{children:"Shipping"}),e.jsxs("span",{children:["NPR ",Number(a.shipping_cost||0).toLocaleString()]})]}):null,e.jsxs("div",{className:"flex justify-between items-center pt-2 border-t border-zinc-800 font-semibold tracking-wider uppercase",children:[e.jsx("span",{children:"Total"}),e.jsxs("span",{children:["NPR ",Number(a.total||0).toLocaleString()]})]}),a.promo_code?e.jsxs("div",{className:"text-xs text-gray-400 tracking-wider",children:["Promo Applied: ",a.promo_code]}):null]})]}),a.exchange_request?e.jsxs("div",{className:"space-y-4 border-t border-zinc-800 pt-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium mb-2 tracking-wider uppercase",children:"Exchange Request"}),e.jsx("p",{className:"text-sm tracking-wider text-gray-300",children:a.exchange_request.reason}),e.jsxs("p",{className:"mt-2 text-xs uppercase tracking-wider text-gray-400",children:["Status: ",a.exchange_request.status.replace("_"," ")]}),a.exchange_request.reviewedBy?e.jsxs("p",{className:"mt-1 text-xs uppercase tracking-wider text-gray-400",children:["Reviewed by ",a.exchange_request.reviewedBy]}):null,a.exchange_request.adminMessage?e.jsxs("div",{className:"mt-3 rounded border border-zinc-800 bg-zinc-800 p-3",children:[e.jsx("p",{className:"text-xs uppercase tracking-wider text-gray-400",children:"Message to Customer"}),e.jsx("p",{className:"mt-2 text-sm text-gray-300",children:a.exchange_request.adminMessage})]}):null]}),a.exchange_request.images.length>0?e.jsx("div",{className:"grid grid-cols-2 gap-3 md:grid-cols-3",children:a.exchange_request.images.map((t,i)=>e.jsx("img",{src:t,alt:`Exchange request ${i+1}`,className:"h-28 w-full rounded object-cover"},`${a.id}-exchange-${i}`))}):null,a.exchange_request.status==="pending"?e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"mb-2 block text-xs uppercase tracking-wider text-gray-400",children:"Message to Customer"}),e.jsx("textarea",{value:A,onChange:t=>L(t.target.value),rows:4,className:"w-full rounded border border-zinc-700 bg-zinc-950 text-white px-3 py-2 text-sm tracking-wider focus:border-white focus:outline-none",placeholder:"Add a note explaining the approval or denial of this exchange request"})]}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsx("button",{type:"button",onClick:()=>F(a.id,"approved"),className:"px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors tracking-wider uppercase text-sm",children:"Approve Exchange"}),e.jsx("button",{type:"button",onClick:()=>F(a.id,"rejected"),className:"px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors tracking-wider uppercase text-sm",children:"Reject Exchange"})]})]}):null]}):null,e.jsxs("div",{className:"flex justify-end gap-3 border-t border-zinc-800 pt-4",children:[e.jsx("button",{onClick:()=>T(a),className:"px-4 py-2 bg-zinc-800 text-gray-200 hover:bg-zinc-700 transition-colors tracking-wider uppercase text-sm",children:"Print Order"}),e.jsx("button",{onClick:X,className:"px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors tracking-wider uppercase text-sm",children:"Save Remarks"})]})]})]})})]})}export{he as OrderManagement};

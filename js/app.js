const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORE = "stockflow_v3_data";
const money = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Number(n)||0);
const number = n => new Intl.NumberFormat("es-CO").format(Number(n)||0);
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const seedCategories = ["Computadores","Periféricos","Redes","Componentes","Almacenamiento","Accesorios"];
const seedProducts = [
["PC001","Computador de escritorio","Equipo de cómputo para uso académico",1850000,8,4,"Computadores","💻"],
["TEC001","Teclado USB","Teclado alámbrico estándar",45000,25,8,"Periféricos","⌨️"],
["ROU001","Router inalámbrico AC1200","Router doméstico de doble banda",160000,3,5,"Redes","📡"],
["MOU001","Mouse USB","Mouse óptico alámbrico",28000,18,5,"Periféricos","🖱️"],
["CAB001","Cable de red Cat 6 (3 m)","Cable Ethernet para laboratorio",15000,2,10,"Redes","🔌"],
["MON001","Monitor LED 24 pulgadas","Monitor Full HD para estación de trabajo",520000,6,3,"Computadores","🖥️"],
["LAP001","Portátil 15.6 pulgadas","Portátil de entrada para estudio",2100000,4,3,"Computadores","💻"],
["SSD001","SSD SATA 480 GB","Unidad de estado sólido",155000,7,4,"Almacenamiento","💾"],
["UPS001","UPS 600 VA","Respaldo básico de energía",240000,2,3,"Componentes","🔋"],
["RAM001","Memoria RAM 8 GB","Módulo DDR4",95000,12,4,"Componentes","▤"]
];
let categories=[...seedCategories], products=[], movements=[], pendingImage="";
function seed(){
 products=seedProducts.map((p,i)=>({id:i+1,code:p[0],name:p[1],description:p[2],price:p[3],stock:p[4],min:p[5],category:p[6],status:"Activo",emoji:p[7],image:""}));
 movements=[{id:1,date:Date.now()-3600000,productId:1,productName:products[0].name,code:products[0].code,type:"Entrada",quantity:8,result:8,note:"Stock inicial"}];
}
function persist(){try{localStorage.setItem(STORE,JSON.stringify({categories,products,movements}));return true}catch(e){toast("No se pudo guardar. El almacenamiento del navegador está lleno.");return false}}
function load(){try{const d=JSON.parse(localStorage.getItem(STORE));if(d&&Array.isArray(d.products)&&Array.isArray(d.categories)&&Array.isArray(d.movements)){categories=d.categories;products=d.products;movements=d.movements;return}}catch(e){}seed();persist()}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2800)}
function active(){return products.filter(p=>p.status==="Activo")}
function stockState(p){return p.stock===0?"Agotado":p.stock<=p.min?"Stock bajo":"Saludable"}
function productImage(p){return p.image?`<img src="${p.image}" alt="">`:esc(p.emoji||"▦")}
function go(page){const names={dashboard:"Panel principal",inventory:"Inventario",categories:"Categorías",movements:"Movimientos",reports:"Reportes","backup":"Importar / Exportar"};if(!names[page])return;$$(".page").forEach(x=>x.classList.toggle("active",x.id===`page-${page}`));$$(".nav-link").forEach(x=>x.classList.toggle("active",x.dataset.page===page));$("#crumb").textContent=names[page];$("#sidebar").classList.remove("open");renderAll()}
function renderDashboard(){
 const a=active(),units=a.reduce((s,p)=>s+p.stock,0),low=a.filter(p=>p.stock>0&&p.stock<=p.min),out=a.filter(p=>p.stock===0),value=a.reduce((s,p)=>s+p.price*p.stock,0),healthy=a.filter(p=>p.stock>p.min);
 $("#metricProducts").textContent=number(a.length);$("#metricUnits").textContent=number(units);$("#metricLow").textContent=number(low.length+out.length);$("#metricValue").textContent=money(value);
 $("#donutTotal").textContent=number(units);$("#healthyCount").textContent=number(healthy.length);$("#lowCount").textContent=number(low.length);$("#outCount").textContent=number(out.length);
 const total=Math.max(1,healthy.length+low.length+out.length),g=healthy.length/total*100,y=low.length/total*100;
 $("#stockDonut").style.background=`conic-gradient(var(--green) 0 ${g}%,var(--amber) ${g}% ${g+y}%,var(--red) ${g+y}% 100%)`;
 const attention=[...low,...out];$("#attentionRows").innerHTML=attention.slice(0,6).map(p=>`<tr class="product-row" data-view="${p.id}"><td><div class="prod-cell"><div class="prod-thumb">${productImage(p)}</div><div><strong>${esc(p.name)}</strong><small>${esc(p.description)}</small></div></div></td><td>${esc(p.code)}</td><td>${number(p.stock)}</td><td>${number(p.min)}</td><td><span class="status ${p.stock===0?"bad":"warn"}">${stockState(p)}</span></td></tr>`).join("");
 $("#attentionEmpty").classList.toggle("hidden",attention.length>0);
 $("#recentList").innerHTML=movements.slice().sort((a,b)=>b.date-a.date).slice(0,5).map(m=>`<div class="recent-item"><div class="recent-dot">${m.type==="Entrada"?"↓":m.type==="Salida"?"↑":"↔"}</div><div><strong>${esc(m.productName)}</strong><small>${esc(m.type)} · ${new Date(m.date).toLocaleString("es-CO")}</small></div><b class="${m.type==="Entrada"?"positive":""}">${m.type==="Salida"?"−":"+"}${number(m.quantity)}</b></div>`).join("")||'<div class="empty-state">Sin actividad registrada.</div>';
 $("#navCount").textContent=products.length;
}
function renderProducts(){
 const q=($("#productSearch")?.value||"").toLowerCase(),status=$("#statusFilter")?.value||"all",cat=$("#categoryFilter")?.value||"all";
 const list=products.filter(p=>(`${p.name} ${p.code} ${p.description}`.toLowerCase().includes(q))&&(status==="all"||p.status===status)&&(cat==="all"||p.category===cat));
 $("#productCount").textContent=list.length;
 $("#productRows").innerHTML=list.map(p=>`<tr><td><div class="prod-cell"><div class="prod-thumb">${productImage(p)}</div><div><strong>${esc(p.name)}</strong><small>${esc(p.description)}</small></div></div></td><td>${esc(p.code)}</td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td><span class="status ${p.stock===0?"bad":p.stock<=p.min?"warn":"good"}">${number(p.stock)} uds.</span></td><td><span class="status ${p.status==="Activo"?"good":"off"}">${p.status}</span></td><td><div class="action-group"><button class="mini-btn" data-view="${p.id}">Ver</button><button class="mini-btn" data-edit="${p.id}">Editar</button><button class="mini-btn" data-toggle="${p.id}">${p.status==="Activo"?"Desactivar":"Activar"}</button><button class="mini-btn delete" data-delete="${p.id}">Eliminar</button></div></td></tr>`).join("");
 $("#productsEmpty").classList.toggle("hidden",list.length>0);
}
function fillCategorySelects(){
 const opts=categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
 $("#fCategory").innerHTML=opts||'<option value="">Crea una categoría primero</option>';
 const current=$("#categoryFilter").value;$("#categoryFilter").innerHTML='<option value="all">Todas las categorías</option>'+opts;if(categories.includes(current))$("#categoryFilter").value=current;
}
function renderCategories(){
 $("#categoryGrid").innerHTML=categories.map((c,i)=>{const count=products.filter(p=>p.category===c).length;return `<article class="category-card" data-category-view="${esc(c)}" tabindex="0" role="button" aria-label="Ver productos de ${esc(c)}"><div class="category-top"><span class="category-icon">${["▦","⌘","◇","▤","▣","⚙"][i%6]}</span><span class="count-badge">${count} productos</span></div><h3>${esc(c)}</h3><p>Grupo de inventario</p><div class="category-actions"><button class="mini-btn" data-rename="${esc(c)}">Renombrar</button><button class="mini-btn delete" data-delcat="${esc(c)}">Eliminar</button></div></article>`}).join("")||'<div class="empty-state">Todavía no hay categorías.</div>';
}
function renderMovements(){
 const f=$("#movementFilter").value,list=movements.filter(m=>f==="all"||m.type===f).slice().sort((a,b)=>b.date-a.date);
 $("#movementCount").textContent=list.length;$("#movementRows").innerHTML=list.map(m=>`<tr><td>${new Date(m.date).toLocaleString("es-CO")}</td><td><strong>${esc(m.productName)}</strong><small class="sub">${esc(m.code)}</small></td><td><span class="status ${m.type==="Entrada"?"good":m.type==="Salida"?"warn":"off"}">${m.type}</span></td><td>${number(m.quantity)}</td><td>${number(m.result)}</td><td>${esc(m.note||"—")}</td></tr>`).join("");$("#movementEmpty").classList.toggle("hidden",list.length>0);
}
function renderReports(){
 const a=active(),total=a.reduce((s,p)=>s+p.stock,0);$("#reportValue").textContent=money(a.reduce((s,p)=>s+p.price*p.stock,0));$("#reportActive").textContent=number(a.length);$("#reportOut").textContent=number(a.filter(p=>p.stock===0).length);
 const sums=categories.map(c=>({name:c,value:products.filter(p=>p.category===c&&p.status==="Activo").reduce((s,p)=>s+p.price*p.stock,0)})).sort((a,b)=>b.value-a.value),max=Math.max(1,...sums.map(x=>x.value));
 $("#categoryBars").innerHTML=sums.map(x=>`<div class="bar-row"><strong>${esc(x.name)}</strong><div class="bar-track"><div class="bar-fill" style="width:${x.value/max*100}%"></div></div><span class="bar-value">${money(x.value)}</span></div>`).join("")||'<div class="empty-state">No hay datos para mostrar.</div>';
}

function openProductDetail(id){
 const p=products.find(x=>x.id===Number(id));if(!p)return;
 $("#detailTitle").textContent=p.name;
 $("#detailBody").innerHTML=`<div class="detail-image">${p.image?`<img src="${p.image}" alt="${esc(p.name)}">`:esc(p.emoji||"▦")}</div><div class="detail-info"><div class="detail-tags"><span class="status ${p.status==="Activo"?"good":"off"}">${p.status}</span><span class="status ${p.stock===0?"bad":p.stock<=p.min?"warn":"good"}">${stockState(p)}</span></div><h3>${esc(p.name)}</h3><p class="detail-description">${esc(p.description||"Sin descripción registrada.")}</p><div class="detail-stats"><div class="detail-stat"><small>CÓDIGO / SKU</small><strong>${esc(p.code)}</strong></div><div class="detail-stat"><small>CATEGORÍA</small><strong>${esc(p.category)}</strong></div><div class="detail-stat"><small>PRECIO UNITARIO</small><strong>${money(p.price)}</strong></div><div class="detail-stat"><small>EXISTENCIAS</small><strong>${number(p.stock)} uds.</strong></div><div class="detail-stat"><small>STOCK MÍNIMO</small><strong>${number(p.min)} uds.</strong></div><div class="detail-stat"><small>VALOR EN INVENTARIO</small><strong>${money(p.price*p.stock)}</strong></div></div></div>`;
 $("#detailActions").innerHTML=`<button class="btn btn-secondary" data-close="detailModal">Cerrar</button><button class="btn btn-secondary" data-detail-movement="${p.id}">⇄ Movimiento</button><button class="btn btn-primary" data-detail-edit="${p.id}">Editar producto</button>`;
 openModal("detailModal");
}
function openCategoryDetail(name){
 const items=products.filter(p=>p.category===name);
 $("#categoryDetailTitle").textContent=name;
 $("#categoryDetailBody").innerHTML=`<div class="category-detail-summary"><strong>${items.length}</strong> productos registrados en esta categoría <span style="margin-left:auto">Valor: <b>${money(items.reduce((s,p)=>s+p.price*p.stock,0))}</b></span></div><div class="category-products">${items.map(p=>`<button class="category-product" data-view="${p.id}"><span class="prod-thumb">${productImage(p)}</span><span class="cp-meta"><strong>${esc(p.name)}</strong><small>${esc(p.code)} · ${money(p.price)}</small></span><span class="cp-stock">${number(p.stock)} uds.</span><span>›</span></button>`).join("")||'<div class="empty-state">Esta categoría todavía no tiene productos. Puedes añadir uno.</div>'}</div>`;
 $("#categoryAddProduct").onclick=()=>{closeModal("categoryDetailModal");openProduct();$("#fCategory").value=name;};
 openModal("categoryDetailModal");
}

function renderAll(){fillCategorySelects();renderDashboard();renderProducts();renderCategories();renderMovements();renderReports()}
function openModal(id){$("#"+id).classList.add("show");document.body.style.overflow="hidden"}
function closeModal(id){$("#"+id).classList.remove("show");document.body.style.overflow=""}
function openProduct(id=null){
 if(!categories.length){go("categories");toast("Primero crea una categoría para registrar productos.");return}
 $("#productForm").reset();$("#editId").value="";pendingImage="";$("#fMin").value=5;$("#imageName").textContent="PNG, JPG o WEBP · Máx. 1 MB";$("#imagePreview").textContent="▧";
 $("#productModalTitle").textContent=id?"Editar producto":"Añadir producto";
 if(id){const p=products.find(x=>x.id===Number(id));if(!p)return;$("#editId").value=p.id;$("#fName").value=p.name;$("#fCode").value=p.code;$("#fCategory").value=p.category;$("#fPrice").value=p.price;$("#fStock").value=p.stock;$("#fMin").value=p.min;$("#fDescription").value=p.description||"";pendingImage=p.image||"";if(pendingImage)$("#imagePreview").innerHTML=`<img src="${pendingImage}" alt="">`;$("#imageName").textContent=pendingImage?"Imagen actual":"PNG, JPG o WEBP · Máx. 1 MB"}
 openModal("productModal");
}
function saveProduct(e){
 e.preventDefault();const id=Number($("#editId").value)||null,code=$("#fCode").value.trim(),name=$("#fName").value.trim(),price=Number($("#fPrice").value),stock=Number($("#fStock").value),min=Number($("#fMin").value),category=$("#fCategory").value;
 if(!code||!name||!category||![price,stock,min].every(Number.isFinite)||price<0||stock<0||min<0||![stock,min].every(Number.isInteger)){toast("Revisa los datos. Precio y cantidades deben ser válidos.");return}
 if(products.some(p=>p.code.toLowerCase()===code.toLowerCase()&&p.id!==id)){toast("Ese código ya existe. Utiliza uno diferente.");$("#fCode").focus();return}
 const old=products.find(p=>p.id===id),p={id:id||Date.now(),code,name,description:$("#fDescription").value.trim(),price,stock,min,category,status:old?.status||"Activo",image:pendingImage,emoji:old?.emoji||"▦"};
 if(old){const diff=stock-old.stock;products=products.map(x=>x.id===id?p:x);if(diff)movements.unshift({id:Date.now(),date:Date.now(),productId:id,productName:name,code,type:"Ajuste",quantity:Math.abs(diff),result:stock,note:"Ajuste desde edición"});}
 else{products.unshift(p);if(stock)movements.unshift({id:Date.now(),date:Date.now(),productId:p.id,productName:name,code,type:"Entrada",quantity:stock,result:stock,note:"Stock inicial"});}
 persist();closeModal("productModal");renderAll();toast(old?"Producto actualizado.":"Producto registrado.");
}
function openMovement(){
 const list=active();if(!list.length){toast("No hay productos activos para mover.");return}
 $("#movementForm").reset();$("#mvProduct").innerHTML=list.map(p=>`<option value="${p.id}">${esc(p.name)} · Stock: ${p.stock}</option>`).join("");openModal("movementModal");
}
function saveMovement(e){
 e.preventDefault();const p=products.find(x=>x.id===Number($("#mvProduct").value)),type=$("#mvType").value,qty=Number($("#mvQty").value),note=$("#mvNote").value.trim();if(!p||!Number.isInteger(qty)||qty<=0){toast("Ingresa una cantidad entera mayor que cero.");return}
 let next=p.stock;if(type==="Entrada")next+=qty;else if(type==="Salida")next-=qty;else next=qty;if(next<0){toast(`Stock insuficiente. Disponible: ${p.stock}.`);return}
 p.stock=next;movements.unshift({id:Date.now(),date:Date.now(),productId:p.id,productName:p.name,code:p.code,type,quantity:qty,result:next,note});persist();closeModal("movementModal");renderAll();toast("Movimiento guardado y stock actualizado.");
}
function csvExport(){const rows=[["Código","Nombre","Descripción","Precio COP","Stock","Stock mínimo","Categoría","Estado"],...products.map(p=>[p.code,p.name,p.description,p.price,p.stock,p.min,p.category,p.status])];const csv="\ufeff"+rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(";")).join("\r\n");download(csv,"stockflow_inventario.csv","text/csv;charset=utf-8");toast("Archivo CSV descargado.");}
function jsonBackup(){download(JSON.stringify({app:"StockFlow",version:3,createdAt:new Date().toISOString(),categories,products,movements},null,2),"stockflow_backup.json","application/json");toast("Copia de seguridad descargada.");}
function download(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url)}
function restoreBackup(){
 const file=$("#restoreFile").files[0];if(!file){toast("Selecciona un archivo JSON primero.");return}
 const reader=new FileReader();reader.onload=()=>{try{const d=JSON.parse(reader.result);if(!Array.isArray(d.products)||!Array.isArray(d.categories)||!Array.isArray(d.movements))throw Error("invalid");if(!confirm("La importación reemplazará los datos actuales. ¿Deseas continuar?"))return;categories=d.categories;products=d.products;movements=d.movements;persist();renderAll();toast("Copia restaurada correctamente.");}catch(e){toast("El archivo no es una copia válida de StockFlow.");}};reader.readAsText(file);
}
function imageFile(file){
 if(!file)return;if(!["image/png","image/jpeg","image/webp"].includes(file.type)){toast("Formato no válido. Usa PNG, JPG o WEBP.");$("#fImage").value="";return}if(file.size>1024*1024){toast("La imagen supera 1 MB.");$("#fImage").value="";return}
 const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,600/Math.max(img.width,img.height)),canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);pendingImage=canvas.toDataURL("image/jpeg",.75);$("#imagePreview").innerHTML=`<img src="${pendingImage}" alt="Vista previa">`;$("#imageName").textContent=file.name};img.src=reader.result};reader.readAsDataURL(file);
}
function addCategory(e){e.preventDefault();const name=$("#categoryName").value.trim();if(!name)return;if(categories.some(c=>c.toLowerCase()===name.toLowerCase())){toast("La categoría ya existe.");return}categories.push(name);$("#categoryName").value="";persist();renderAll();toast("Categoría creada.");}
document.addEventListener("click",e=>{
 const page=e.target.closest("[data-page]");if(page){e.preventDefault();go(page.dataset.page);return}
 const detailEdit=e.target.closest("[data-detail-edit]");if(detailEdit){const id=detailEdit.dataset.detailEdit;closeModal("detailModal");openProduct(id);return}
 const detailMove=e.target.closest("[data-detail-movement]");if(detailMove){const id=Number(detailMove.dataset.detailMovement);closeModal("detailModal");openMovement();$("#mvProduct").value=String(id);return}
 const view=e.target.closest("[data-view]");if(view){e.stopPropagation();openProductDetail(view.dataset.view);return}
 const categoryView=e.target.closest("[data-category-view]");if(categoryView&&!e.target.closest("[data-rename],[data-delcat]")){openCategoryDetail(categoryView.dataset.categoryView);return}

 const action=e.target.closest("[data-action]")?.dataset.action;if(action){if(action==="new-product")openProduct();if(action==="new-movement")openMovement();if(action==="export-csv")csvExport();if(action==="backup-json")jsonBackup();return}
 const close=e.target.closest("[data-close]");if(close){closeModal(close.dataset.close);return}
 const edit=e.target.closest("[data-edit]");if(edit){openProduct(edit.dataset.edit);return}
 const toggle=e.target.closest("[data-toggle]");if(toggle){const p=products.find(x=>x.id===Number(toggle.dataset.toggle));p.status=p.status==="Activo"?"Inactivo":"Activo";persist();renderAll();toast("Estado del producto actualizado.");return}
 const del=e.target.closest("[data-delete]");if(del){const p=products.find(x=>x.id===Number(del.dataset.delete));if(confirm(`¿Eliminar ${p.name} del inventario?`)){products=products.filter(x=>x.id!==p.id);persist();renderAll();toast("Producto eliminado.");}return}
 const rename=e.target.closest("[data-rename]");if(rename){const old=rename.dataset.rename,next=prompt("Nuevo nombre de la categoría:",old);if(next===null)return;const name=next.trim();if(!name||categories.some(c=>c.toLowerCase()===name.toLowerCase())){toast("Nombre vacío o categoría duplicada.");return}categories=categories.map(c=>c===old?name:c);products.forEach(p=>{if(p.category===old)p.category=name});persist();renderAll();toast("Categoría renombrada.");return}
 const dc=e.target.closest("[data-delcat]");if(dc){const name=dc.dataset.delcat;if(products.some(p=>p.category===name)){toast("No puedes eliminarla: tiene productos asignados.");return}if(confirm(`¿Eliminar la categoría ${name}?`)){categories=categories.filter(c=>c!==name);persist();renderAll();toast("Categoría eliminada.");}return}
 if(e.target.classList.contains("modal-backdrop"))closeModal(e.target.id);
});
$("#productForm").addEventListener("submit",saveProduct);$("#movementForm").addEventListener("submit",saveMovement);$("#categoryForm").addEventListener("submit",addCategory);
$("#fImage").addEventListener("change",e=>imageFile(e.target.files[0]));$("#removeImage").addEventListener("click",()=>{pendingImage="";$("#fImage").value="";$("#imagePreview").textContent="▧";$("#imageName").textContent="PNG, JPG o WEBP · Máx. 1 MB"});
$("#restoreFile").addEventListener("change",e=>$("#restoreName").textContent=e.target.files[0]?.name||"Ningún archivo seleccionado");$("#restoreButton").addEventListener("click",restoreBackup);
$("#productSearch").addEventListener("input",renderProducts);$("#statusFilter").addEventListener("change",renderProducts);$("#categoryFilter").addEventListener("change",renderProducts);$("#movementFilter").addEventListener("change",renderMovements);
$("#globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){go("inventory");$("#productSearch").value=e.target.value;renderProducts();}});
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));document.addEventListener("keydown",e=>{if(e.key==="Escape")$$(".modal-backdrop.show").forEach(m=>closeModal(m.id))});
load();renderAll();

document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-category-view]")){e.preventDefault();openCategoryDetail(e.target.dataset.categoryView)}});

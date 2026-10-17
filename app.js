const restaurants = [
  { id: "bibimbap", name: "온기 비빔밥", dish: "제철 나물 비빔밥", category: "한식 · 비빔밥", distance: 6, walk: 8, wait: 5, eat: 22, price: 10500, emoji: "🥗", art: "bowl", photo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=85", tags: ["든든해요", "빠른 픽업"], pickup: true, score: 98, healthy: 5, filling: 4, rating: 4.8, reviews: 126, solo: true, seatNote: "1인석 있어요" },
  { id: "katsu", name: "정돈 카츠", dish: "안심 카츠 정식", category: "돈가스 · 일식", distance: 4, walk: 6, wait: 12, eat: 25, price: 12500, emoji: "🍱", art: "", photo: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85", tags: ["카츠 메뉴", "바삭한 식감"], pickup: false, score: 92, healthy: 2, filling: 5, rating: 4.7, reviews: 310, solo: true, seatNote: "바 좌석 이용 가능" },
  { id: "noodle", name: "면옥 1978", dish: "들기름 막국수", category: "면 요리 · 한식", distance: 7, walk: 9, wait: 4, eat: 18, price: 9500, emoji: "🍜", art: "noodles", photo: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85", tags: ["가벼운 한 끼", "예상 대기 4분"], pickup: false, score: 89, healthy: 4, filling: 3, rating: 4.6, reviews: 88, solo: true, seatNote: "혼밥 편한 테이블" },
  { id: "wrap", name: "그린테이블", dish: "치킨 아보카도 랩", category: "샐러드 · 샌드위치", distance: 3, walk: 5, wait: 4, eat: 15, price: 8900, emoji: "🌯", art: "wrap", photo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85", tags: ["치킨·아보카도", "픽업 예시"], pickup: true, score: 87, healthy: 5, filling: 3, rating: 4.5, reviews: 74, solo: true, seatNote: "빠른 픽업 추천" },
  { id: "curry", name: "카레공방", dish: "치킨 토마토 카레", category: "카레 · 아시안", distance: 8, walk: 10, wait: 8, eat: 22, price: 11000, emoji: "🍛", art: "curry", photo: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85", tags: ["매콤 달콤", "한 그릇 메뉴"], pickup: false, score: 84, healthy: 3, filling: 5, rating: 4.4, reviews: 52, solo: false, seatNote: "2인 테이블 중심" },
  { id: "soup", name: "담백한 한상", dish: "순두부찌개 정식", category: "한식 · 찌개", distance: 5, walk: 7, wait: 8, eat: 25, price: 9000, emoji: "🍲", art: "soup", photo: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=900&q=85", tags: ["든든해요", "1만원 이하"], pickup: false, score: 82, healthy: 3, filling: 5, rating: 4.3, reviews: 43, solo: true, seatNote: "1인 식사 가능" },
];

const state = { priority: "fast", sort: "recommend", selected: [], saved: new Set(), savedOnly: false, groupMode: false, groupName: "오늘 점심 주문", memberCount: 3, category: "all", search: "", pickupOnly: false, soloOnly: false, priceRange: "all", waitLimit: "all", view: "list" };
const money = (value) => `₩ ${value.toLocaleString("ko-KR")}`;
const $ = (selector) => document.querySelector(selector);

function availableTime(restaurant) { return restaurant.walk * 2 + restaurant.wait + restaurant.eat; }

function visibleRestaurants() {
  const time = Number($("#time-value").value) || 0;
  const budget = Number($("#budget-value").value) || 0;
  $("#rail-budget").textContent = money(budget);
  let items = state.savedOnly ? restaurants.filter((place) => state.saved.has(place.id)) : restaurants.filter((place) => place.price <= budget && availableTime(place) <= time);
  if (!state.savedOnly && state.category !== "all") items = items.filter((place) => place.category.includes(state.category));
  if (!state.savedOnly && state.pickupOnly) items = items.filter((place) => place.pickup);
  if (!state.savedOnly && state.soloOnly) items = items.filter((place) => place.solo);
  if (!state.savedOnly && state.waitLimit !== "all") items = items.filter((place) => place.wait <= Number(state.waitLimit));
  if (!state.savedOnly && state.priceRange === "under7000") items = items.filter((place) => place.price <= 7000);
  if (!state.savedOnly && state.priceRange === "7000-10000") items = items.filter((place) => place.price > 7000 && place.price <= 10000);
  if (!state.savedOnly && state.priceRange === "10000-15000") items = items.filter((place) => place.price > 10000 && place.price <= 15000);
  if (!state.savedOnly && state.priceRange === "over15000") items = items.filter((place) => place.price > 15000);
  if (!state.savedOnly && state.search) {
    const query = state.search.toLocaleLowerCase("ko-KR");
    items = items.filter((place) => `${place.name} ${place.dish} ${place.category} ${place.tags.join(" ")}`.toLocaleLowerCase("ko-KR").includes(query));
  }
  const priority = state.priority;
  items.sort((a, b) => {
    if (state.sort === "distance") return a.distance - b.distance || b.score - a.score;
    if (state.sort === "rating") return b.rating - a.rating || b.reviews - a.reviews;
    if (state.sort === "wait") return a.wait - b.wait || b.score - a.score;
    if (state.sort === "price") return a.price - b.price || b.score - a.score;
    if (priority === "fast") return availableTime(a) - availableTime(b) || b.score - a.score;
    if (priority === "cheap") return a.price - b.price || b.score - a.score;
    if (priority === "healthy") return b.healthy - a.healthy || b.score - a.score;
    return b.filling - a.filling || b.score - a.score;
  });
  renderCategoryCounts();
  return items;
}

function renderCategoryCounts() {
  document.querySelectorAll("[data-category]").forEach((button) => {
    const key = button.dataset.category;
    const count = key === "all" ? restaurants.length : restaurants.filter((place) => place.category.includes(key)).length;
    const label = button.querySelector(".category-count");
    if (label) label.textContent = count;
  });
}

function renderMap(items) {
  const map = $("#sample-map");
  const positions = [[22, 28], [62, 24], [43, 53], [78, 63], [26, 72], [58, 82]];
  map.innerHTML = items.length ? items.map((place) => {
    const originalIndex = restaurants.findIndex((item) => item.id === place.id);
    const [left, top] = positions[originalIndex % positions.length];
    return `<button class="map-pin" type="button" style="--pin-x:${left}%;--pin-y:${top}%" data-map="${place.id}" aria-label="${place.name}, 도보 ${place.walk}분"><span>${place.name} · ${place.distance * 100}m</span><b>🍴</b></button>`;
  }).join("") : `<span class="map-empty">조건에 맞는 식당이 없어요</span>`;
}

function renderRestaurants() {
  const list = $("#restaurant-list");
  const items = visibleRestaurants();
  $("#result-count").textContent = items.length;
  $("#empty-state").hidden = items.length > 0;
  renderMap(items);
  $("#map-preview").hidden = state.view !== "map";
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === state.view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  list.innerHTML = items.map((place, index) => {
    const selected = state.selected.some((item) => item.id === place.id);
    const total = availableTime(place);
    const badge = index === 0 ? `<span class="fit-badge">${state.priority === "fast" ? "조건 적합" : state.priority === "cheap" ? "예산 우선" : state.priority === "healthy" ? "가볍게 추천" : "든든 추천"}</span>` : "";
    return `<article class="restaurant-card" data-id="${place.id}">
      <div class="food-art ${place.art}"><img src="${place.photo}" alt="${place.dish}" loading="lazy" onerror="this.remove();this.nextElementSibling.style.display='grid'"><span class="food-emoji">${place.emoji}</span></div>
      <div class="restaurant-info"><div class="restaurant-topline"><strong class="restaurant-name">${place.name}</strong>${badge}</div><div class="restaurant-meta">${place.dish} <span>·</span> ${place.category}</div><div class="restaurant-social"><span class="rating">★ ${place.rating.toFixed(1)} <small>(${place.reviews})</small></span><span>${place.distance * 100}m · 도보 ${place.walk}분</span><span class="solo-note ${place.solo ? "available" : ""}">${place.solo ? place.seatNote : "2인 좌석 중심"}</span></div><div class="restaurant-tags">${place.tags.map((tag, tagIndex) => `<span class="restaurant-tag ${tagIndex === 0 ? "green" : ""}">${tag}</span>`).join("")}<span class="restaurant-tag wait-tag">예상 대기 ${place.wait}분</span></div></div>
      <div class="restaurant-stats"><div class="price">${money(place.price)} <small>/ 1인</small></div><div class="time-estimate"><strong>${total}분</strong> · 총 예상</div><button class="save-button ${state.saved.has(place.id) ? "saved" : ""}" type="button" aria-label="${place.name} 저장" data-save="${place.id}">${state.saved.has(place.id) ? "♥" : "♡"}</button><div class="card-action"><button class="add-button ${selected ? "added" : ""}" type="button" data-add="${place.id}">${selected ? "✓ 담았어요" : "+ 담기"}</button></div></div>
    </article>`;
  }).join("");
}

function renderSelection() {
  const container = $("#selected-menu");
  const count = state.selected.length;
  $("#selection-count").textContent = count;
  if (!count) {
    container.className = "selected-menu empty-selection";
    container.innerHTML = `<div class="selection-empty-icon">＋</div><div><strong>아직 메뉴를 고르지 않았어요</strong><span>추천 메뉴에서 마음에 드는 메뉴를 담아보세요.</span></div>`;
  } else {
    container.className = "selected-menu selected-items";
    container.innerHTML = state.selected.map((item, index) => `<div class="selected-item" data-id="${item.id}"><button class="drag-handle" type="button" aria-label="${item.name} 순서 이동" title="길게 눌러 이동">⠿</button><div class="selected-item-copy"><strong><span class="item-order">${index + 1}</span>${item.name}</strong><small>${item.dish}</small></div><span class="item-price">${money(item.price)}</span><div class="item-controls"><button type="button" data-move="-1" data-id="${item.id}" aria-label="${item.name} 위로 이동">↑</button><button type="button" data-move="1" data-id="${item.id}" aria-label="${item.name} 아래로 이동">↓</button><button type="button" data-remove="${item.id}" aria-label="${item.name} 삭제">×</button></div></div>`).join("");
  }
  const total = state.selected.reduce((sum, item) => sum + item.price, 0);
  const budget = Number($("#budget-value").value) || 0;
  const percent = budget ? Math.min(100, Math.round(total / budget * 100)) : 0;
  $("#estimated-cost").textContent = money(total);
  $("#mobile-basket-title").textContent = count ? `${state.selected[0].name}${count > 1 ? ` 외 ${count - 1}개` : ""}` : "메뉴를 담아보세요";
  $("#mobile-basket-count").textContent = `선택 메뉴 ${count}개`;
  $("#mobile-basket-total").innerHTML = count ? `${money(total)} <span>↑</span>` : `목록 보기 <span>↑</span>`;
  $("#budget-track-fill").style.width = `${percent}%`;
  $("#budget-track-fill").classList.toggle("over", total > budget);
  $("#budget-caption").textContent = total === 0 ? "메뉴를 담으면 예산을 계산해요" : total > budget ? `예산보다 ${money(total - budget)} 초과했어요` : `예산 ${money(budget - total)} 남았어요`;
  $("#budget-percent").textContent = `${budget ? Math.round(total / budget * 100) : 0}%`;
  const cta = $("#continue-button");
  cta.disabled = !count;
  cta.innerHTML = count ? `${state.groupMode ? "주문 목록 확인하기" : "이 메뉴로 결정하기"}<span>→</span>` : `메뉴를 먼저 골라주세요 <span>→</span>`;
  $("#rail-tip").textContent = !count ? "조건에 맞는 메뉴를 골라 시간을 아껴보세요!" : total > budget ? "예산을 조금 넘었어요. 다른 메뉴도 비교해 보세요." : `${state.selected[0].name}, 오늘 조건에 잘 맞아요!`;
}

function updateTimePreview() {
  const minutes = Math.max(20, Number($("#time-value").value) || 70);
  const startMinutes = 12 * 60 + 10;
  const returnMinutes = startMinutes + minutes;
  const format = (value) => `${String(Math.floor(value / 60) % 24).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  document.querySelector(".time-stop:first-child strong").textContent = format(startMinutes);
  document.querySelector(".time-stop:last-child strong").textContent = format(returnMinutes);
  document.querySelector(".line-segment span").textContent = `${minutes}분`;
  document.querySelector(".time-card-foot strong").textContent = `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
  $("#lunch-window-stat").innerHTML = `${minutes}<span>분</span>`;
}

function refresh() { renderRestaurants(); renderSelection(); updateTimePreview(); }

$("#today-label").textContent = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(new Date());

let toastTimer;
function toast(message) {
  const node = $("#toast"); node.textContent = message; node.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove("show"), 2300);
}

document.querySelectorAll(".chip").forEach((chip) => chip.addEventListener("click", () => {
  document.querySelectorAll(".chip").forEach((item) => item.classList.remove("active"));
  chip.classList.add("active"); state.priority = chip.dataset.priority; refresh();
}));
$("#preferences-form").addEventListener("submit", (event) => { event.preventDefault(); refresh(); const count = visibleRestaurants().length; $("#result-notice").textContent = count ? `조건에 맞는 메뉴 ${count}개를 찾았어요. 실제 이용 정보는 매장에서 확인해 주세요.` : ""; $("#recommendations").scrollIntoView({ behavior: "smooth", block: "start" }); });
$("#time-value").addEventListener("input", refresh);
$("#budget-value").addEventListener("input", refresh);
$("#menu-search").addEventListener("input", (event) => { state.search = event.target.value.trim(); renderRestaurants(); });
document.querySelector(".search-box kbd").addEventListener("click", () => $("#menu-search").focus());
document.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#menu-search").focus(); } });
document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => {
  state.category = button.dataset.category;
  document.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("active", item === button));
  renderRestaurants();
}));
$("#price-filter").addEventListener("change", (event) => { state.priceRange = event.target.value; renderRestaurants(); });
$("#wait-filter").addEventListener("change", (event) => { state.waitLimit = event.target.value; renderRestaurants(); });
$("#solo-filter").addEventListener("click", (event) => {
  state.soloOnly = !state.soloOnly;
  event.currentTarget.setAttribute("aria-pressed", String(state.soloOnly));
  event.currentTarget.classList.toggle("active", state.soloOnly);
  renderRestaurants();
});
$("#sort-select").addEventListener("change", (event) => { state.sort = event.target.value; renderRestaurants(); });
document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.view; renderRestaurants(); }));
$("#sample-map").addEventListener("click", (event) => {
  const pin = event.target.closest("[data-map]");
  if (!pin) return;
  const card = $(`.restaurant-card[data-id="${pin.dataset.map}"]`);
  card?.scrollIntoView({ behavior: "smooth", block: "center" });
  card?.classList.add("map-highlight");
  setTimeout(() => card?.classList.remove("map-highlight"), 1300);
});
document.querySelectorAll("[data-quick]").forEach((button) => button.addEventListener("click", () => {
  const quick = button.dataset.quick;
  state.pickupOnly = quick === "pickup" ? !state.pickupOnly : false;
  if (quick === "under10000") $("#budget-value").value = 10000;
  if (quick === "quick") $("#time-value").value = 45;
  if (quick === "clear") { $("#budget-value").value = 12000; $("#time-value").value = 70; state.pickupOnly = false; state.savedOnly = false; state.search = ""; state.soloOnly = false; state.priceRange = "all"; state.waitLimit = "all"; $("#price-filter").value = "all"; $("#wait-filter").value = "all"; $("#solo-filter").classList.remove("active"); $("#solo-filter").setAttribute("aria-pressed", "false"); $("#menu-search").value = ""; state.category = "all"; document.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("active", item.dataset.category === "all")); }
  document.querySelectorAll("[data-quick]").forEach((item) => item.classList.toggle("active", item === button && quick !== "clear" && (quick !== "pickup" || state.pickupOnly)));
  refresh();
}));
$("#reset-button").addEventListener("click", () => { $("#time-value").value = 70; $("#budget-value").value = 12000; state.priority = "fast"; state.sort = "recommend"; state.category = "all"; state.search = ""; state.pickupOnly = false; state.savedOnly = false; state.soloOnly = false; state.priceRange = "all"; state.waitLimit = "all"; $("#sort-select").value = "recommend"; $("#price-filter").value = "all"; $("#wait-filter").value = "all"; $("#menu-search").value = ""; $("#solo-filter").classList.remove("active"); $("#solo-filter").setAttribute("aria-pressed", "false"); document.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("active", item.dataset.category === "all")); document.querySelectorAll("[data-quick]").forEach((item) => item.classList.remove("active")); document.querySelectorAll(".chip").forEach((item) => item.classList.toggle("active", item.dataset.priority === "fast")); $("#result-notice").textContent = ""; state.selected = []; refresh(); toast("조건을 기본값으로 되돌렸어요."); });
$("#relax-button").addEventListener("click", () => { $("#time-value").value = Math.min(180, (Number($("#time-value").value) || 70) + 20); $("#budget-value").value = Math.max(15000, Number($("#budget-value").value) || 12000); $("#result-notice").textContent = "시간과 예산 조건을 조금 넓혔어요."; refresh(); });
$("#restaurant-list").addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]"); const save = event.target.closest("[data-save]");
  if (add) { const place = restaurants.find((item) => item.id === add.dataset.add); const exists = state.selected.some((item) => item.id === place.id); state.selected = exists ? state.selected.filter((item) => item.id !== place.id) : [...state.selected, place]; refresh(); toast(exists ? "선택한 메뉴를 뺐어요." : `${place.dish} 메뉴를 담았어요.`); }
  if (save) { const id = save.dataset.save; state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id); renderRestaurants(); toast(state.saved.has(id) ? "저장한 메뉴에 추가했어요." : "저장을 취소했어요."); }
});
function moveSelected(id, offset) {
  const from = state.selected.findIndex((item) => item.id === id);
  const to = from + offset;
  if (from < 0 || to < 0 || to >= state.selected.length) return;
  [state.selected[from], state.selected[to]] = [state.selected[to], state.selected[from]];
  refresh();
  $("#selection-announcement").textContent = `${state.selected[to].name}, ${to + 1}번째로 이동했어요.`;
}

$("#selected-menu").addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove]");
  const move = event.target.closest("[data-move]");
  if (remove) { state.selected = state.selected.filter((item) => item.id !== remove.dataset.remove); refresh(); }
  if (move) moveSelected(move.dataset.id, Number(move.dataset.move));
});

let pointerDrag = null;
const selectedMenu = $("#selected-menu");
selectedMenu.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest(".drag-handle");
  if (!handle) return;
  const row = handle.closest(".selected-item");
  if (!row) return;
  pointerDrag = { id: row.dataset.id, row, startY: event.clientY, started: false };
  handle.setPointerCapture(event.pointerId);
  event.preventDefault();
});
selectedMenu.addEventListener("pointermove", (event) => {
  if (!pointerDrag) return;
  if (!pointerDrag.started && Math.abs(event.clientY - pointerDrag.startY) < 7) return;
  pointerDrag.started = true;
  pointerDrag.row.classList.add("dragging");
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".selected-item");
  if (!target || target === pointerDrag.row) return;
  const insertAfter = event.clientY > target.getBoundingClientRect().top + target.offsetHeight / 2;
  selectedMenu.insertBefore(pointerDrag.row, insertAfter ? target.nextElementSibling : target);
});
function finishPointerDrag() {
  if (!pointerDrag) return;
  const changed = pointerDrag.started;
  pointerDrag.row.classList.remove("dragging");
  if (changed) {
    const order = [...selectedMenu.querySelectorAll(".selected-item[data-id]")].map((row) => row.dataset.id);
    state.selected = order.map((id) => state.selected.find((item) => item.id === id)).filter(Boolean);
    refresh();
    $("#selection-announcement").textContent = "선택 메뉴 순서를 변경했어요.";
  }
  pointerDrag = null;
}
selectedMenu.addEventListener("pointerup", finishPointerDrag);
selectedMenu.addEventListener("pointercancel", finishPointerDrag);

function setMobileSheet(open) {
  $("#group").classList.toggle("mobile-open", open);
  $("#mobile-basket").setAttribute("aria-expanded", String(open));
  $("#sheet-backdrop").hidden = !open;
  document.body.classList.toggle("sheet-is-open", open);
}
$("#mobile-basket").addEventListener("click", () => setMobileSheet(!$("#group").classList.contains("mobile-open")));
$("#sheet-backdrop").addEventListener("click", () => setMobileSheet(false));
$("#solo-tab").addEventListener("click", () => { state.groupMode = false; $("#solo-tab").classList.add("selected"); $("#solo-tab").setAttribute("aria-selected", "true"); $("#group-tab").classList.remove("selected"); $("#group-tab").setAttribute("aria-selected", "false"); $("#group-inline").hidden = true; renderSelection(); });
$("#group-tab").addEventListener("click", () => { state.groupMode = true; $("#group-tab").classList.add("selected"); $("#group-tab").setAttribute("aria-selected", "true"); $("#solo-tab").classList.remove("selected"); $("#solo-tab").setAttribute("aria-selected", "false"); $("#group-inline").hidden = false; renderSelection(); });
const dialog = $("#group-dialog");
$("#create-group").addEventListener("click", () => dialog.showModal());
$("#dialog-create").addEventListener("click", () => {
  state.groupName = $("#group-name").value.trim() || "오늘 점심 주문"; state.memberCount = Number($("#group-members").value);
  dialog.close();
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const invitation = `${location.origin}${location.pathname}#group-${inviteCode}`;
  $("#group-inline div").innerHTML = `<strong>${state.groupName} · ${state.memberCount}명</strong><span>참여 링크가 준비됐어요. 링크를 동료에게 보내주세요.</span>`;
  $("#group-inline button").innerHTML = `링크 복사 <span>↗</span>`;
  $("#group-inline button").onclick = async () => { try { await navigator.clipboard.writeText(invitation); toast("참여 링크를 복사했어요."); } catch { toast(`참여 코드 ${inviteCode} · 샘플 링크`); } };
  toast("주문방을 만들었어요. 메뉴를 담아보세요.");
});
$("#continue-button").addEventListener("click", () => {
  if (!state.selected.length) return;
  if (state.groupMode) {
    const sum = state.selected.reduce((total, item) => total + item.price, 0);
    const perPerson = Math.ceil(sum / state.memberCount / 10) * 10;
    toast(`${state.memberCount}명 주문 예상 · 1인 약 ${money(perPerson)} (균등 정산)`);
  } else toast(`${state.selected.map((item) => item.dish).join(", ")} · 선택을 저장했어요.`);
});
document.querySelector(".rail-close").addEventListener("click", () => {
  if (window.matchMedia("(max-width: 700px)").matches) setMobileSheet(false);
  else toast("점심시간 요약은 화면 오른쪽에 표시돼요.");
});
document.querySelectorAll(".nav-item").forEach((link) => link.addEventListener("click", (event) => { if (link.id !== "group") { event.preventDefault(); if (link.getAttribute("href") === "#saved") { if (!state.saved.size) { toast("식당 카드의 ♡를 눌러 먼저 저장해 주세요."); return; } state.savedOnly = !state.savedOnly; document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item === link && state.savedOnly)); $("#result-notice").textContent = state.savedOnly ? "내가 저장한 식당만 보고 있어요. 다시 누르면 전체 목록으로 돌아갑니다." : ""; renderRestaurants(); $("#recommendations").scrollIntoView({ behavior: "smooth", block: "start" }); } else if (link.getAttribute("href") === "#group") { state.savedOnly = false; state.groupMode = true; $("#group-tab").click(); $("#group-inline").scrollIntoView({ behavior: "smooth", block: "center" }); } else { state.savedOnly = false; document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item === link)); renderRestaurants(); window.scrollTo({ top: 0, behavior: "smooth" }); } } }));

refresh();

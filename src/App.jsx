import { useState, useCallback } from "react";

const COLORS = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF922B","#CC5DE8","#20C997","#F06595"];

const fmt = (n) => `$${Number(n).toFixed(2)}`;

export default function App() {
  const [people, setPeople] = useState(["Alex", "Jordan"]);
  const [newPerson, setNewPerson] = useState("");
  const [items, setItems] = useState([
    { id: 1, name: "Margherita Pizza", price: "18.00", splits: {} },
    { id: 2, name: "Caesar Salad", price: "12.00", splits: {} },
    { id: 3, name: "Draft Beer x2", price: "14.00", splits: {} },
  ]);
  const [newItem, setNewItem] = useState({ name: "", price: "" });
  const [tip, setTip] = useState(18);
  const [tax, setTax] = useState(8.5);
  const [view, setView] = useState("split"); // split | summary

  const addPerson = () => {
    const name = newPerson.trim();
    if (name && !people.includes(name)) {
      setPeople([...people, name]);
      setNewPerson("");
    }
  };

  const removePerson = (name) => {
    setPeople(people.filter((p) => p !== name));
    setItems(items.map((item) => {
      const splits = { ...item.splits };
      delete splits[name];
      return { ...item, splits };
    }));
  };

  const addItem = () => {
    const name = newItem.name.trim();
    const price = parseFloat(newItem.price);
    if (name && price > 0) {
      setItems([...items, { id: Date.now(), name, price: newItem.price, splits: {} }]);
      setNewItem({ name: "", price: "" });
    }
  };

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  const toggleSplit = (itemId, person) => {
    setItems(items.map((item) => {
      if (item.id !== itemId) return item;
      const splits = { ...item.splits };
      if (splits[person]) delete splits[person];
      else splits[person] = true;
      return { ...item, splits };
    }));
  };

  const assignAll = (itemId) => {
    setItems(items.map((item) => {
      if (item.id !== itemId) return item;
      const splits = {};
      people.forEach((p) => (splits[p] = true));
      return { ...item, splits };
    }));
  };

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
  const taxAmt = subtotal * (tax / 100);
  const tipAmt = subtotal * (tip / 100);
  const total = subtotal + taxAmt + tipAmt;

  const personTotals = useCallback(() => {
    const totals = {};
    people.forEach((p) => (totals[p] = 0));
    items.forEach((item) => {
      const price = parseFloat(item.price) || 0;
      const assignees = Object.keys(item.splits);
      if (!assignees.length) return;
      const share = price / assignees.length;
      assignees.forEach((p) => {
        if (totals[p] !== undefined) totals[p] += share;
      });
    });
    // Add tax+tip proportionally
    const assignedSubtotal = items.reduce((s, item) => {
      const price = parseFloat(item.price) || 0;
      return Object.keys(item.splits).length ? s + price : s;
    }, 0);
    people.forEach((p) => {
      if (assignedSubtotal > 0) {
        const ratio = totals[p] / assignedSubtotal;
        totals[p] += (taxAmt + tipAmt) * ratio;
      }
    });
    return totals;
  }, [people, items, taxAmt, tipAmt]);

  const unassignedItems = items.filter((i) => Object.keys(i.splits).length === 0);
  const totals = personTotals();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1a2e",
      fontFamily: "'Courier New', Courier, monospace",
      color: "#f0ebe3",
      padding: "0 0 60px 0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)",
        padding: "28px 24px 24px",
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(233,69,96,0.4)",
      }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>🧾</div>
        <h1 style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "'Courier New', monospace",
        }}>Split The Bill</h1>
        <p style={{ margin: "6px 0 0", opacity: 0.85, fontSize: 13, letterSpacing: "0.1em" }}>
          NO MORE AWKWARD MATH
        </p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", background: "#16213e", borderBottom: "2px solid #0f3460" }}>
        {['split', 'summary'].map((tab) => (
          <button key={tab} onClick={() => setView(tab)} style={{
            flex: 1,
            padding: "14px",
            background: view === tab ? "#e94560" : "transparent",
            border: "none",
            color: view === tab ? "#fff" : "#aaa",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s",
          }}>
            {tab === "split" ? "✂ Split Items" : "💰 Summary"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>

        {view === "split" && (
          <>
            {/* People */}
            <Section title="👥 WHO'S AT THE TABLE">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {people.map((p, i) => (
                  <div key={p} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: COLORS[i % COLORS.length] + "22",
                    border: `2px solid ${COLORS[i % COLORS.length]}`,
                    borderRadius: 20, padding: "5px 12px",
                    fontSize: 13, fontWeight: 700,
                  }}>
                    <span style={{ color: COLORS[i % COLORS.length] }}>{p}</span>
                    <button onClick={() => removePerson(p)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: COLORS[i % COLORS.length], fontSize: 14, padding: 0, lineHeight: 1,
                    }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPerson()}
                  placeholder="Add person..."
                  style={inputStyle}
                />
                <AddButton onClick={addPerson} />
              </div>
            </Section>

            {/* Items */}
            <Section title="🍽 ITEMS">
              {items.map((item, idx) => {
                const price = parseFloat(item.price) || 0;
                const assignees = Object.keys(item.splits);
                const share = assignees.length ? price / assignees.length : null;
                return (
                  <div key={item.id} style={{
                    background: "#16213e",
                    borderRadius: 12,
                    padding: "14px",
                    marginBottom: 10,
                    border: assignees.length === 0 ? "1px dashed #e9456055" : "1px solid #0f3460",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                        <div style={{ color: "#FFD93D", fontSize: 13, marginTop: 2 }}>
                          {fmt(price)}
                          {share && <span style={{ color: "#aaa", fontWeight: 400 }}>
                            {" "}→ {fmt(share)}/person
                          </span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => assignAll(item.id)} style={{
                          ...miniBtn, background: "#4D96FF22", color: "#4D96FF", border: "1px solid #4D96FF55",
                        }}>ALL</button>
                        <button onClick={() => removeItem(item.id)} style={{
                          ...miniBtn, background: "#e9456022", color: "#e94560", border: "1px solid #e9456055",
                        }}>✕</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {people.map((p, i) => {
                        const active = !!item.splits[p];
                        return (
                          <button key={p} onClick={() => toggleSplit(item.id, p)} style={{
                            padding: "5px 12px",
                            borderRadius: 16,
                            border: `2px solid ${COLORS[i % COLORS.length]}`,
                            background: active ? COLORS[i % COLORS.length] : "transparent",
                            color: active ? "#000" : COLORS[i % COLORS.length],
                            fontFamily: "inherit",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}>{p}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Add Item */}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item name..."
                  style={{ ...inputStyle, flex: 2 }}
                />
                <input
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  placeholder="$0.00"
                  style={{ ...inputStyle, flex: 1 }}
                  type="number"
                  min="0"
                  step="0.01"
                />
                <AddButton onClick={addItem} />
              </div>
            </Section>

            {/* Tax & Tip */}
            <Section title="⚙ TAX & TIP">
              <div style={{ display: "flex", gap: 12 }}>
                <SliderField label="Tax" value={tax} onChange={setTax} max={20} color="#4D96FF" />
                <SliderField label="Tip" value={tip} onChange={setTip} max={40} color="#6BCB77" />
              </div>
              <div style={{
                marginTop: 14, padding: "12px 16px",
                background: "#0f3460", borderRadius: 10,
                display: "flex", justifyContent: "space-between",
                fontSize: 13,
              }}>
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div style={{
                padding: "6px 16px",
                display: "flex", justifyContent: "space-between",
                fontSize: 13, color: "#aaa",
              }}>
                <span>Tax ({tax}%)</span><span>{fmt(taxAmt)}</span>
              </div>
              <div style={{
                padding: "6px 16px",
                display: "flex", justifyContent: "space-between",
                fontSize: 13, color: "#aaa",
              }}>
                <span>Tip ({tip}%)</span><span>{fmt(tipAmt)}</span>
              </div>
              <div style={{
                padding: "10px 16px",
                display: "flex", justifyContent: "space-between",
                fontSize: 16, fontWeight: 900,
                borderTop: "1px solid #0f3460", marginTop: 4,
                color: "#FFD93D",
              }}>
                <span>TOTAL</span><span>{fmt(total)}</span>
              </div>
            </Section>

            {unassignedItems.length > 0 && (
              <div style={{
                background: "#e9456015",
                border: "1px solid #e94560",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 13, color: "#e94560",
              }}>
                ⚠ {unassignedItems.length} item{unassignedItems.length > 1 ? "s" : ""} not assigned to anyone
              </div>
            )}
          </>
        )}

        {view === "summary" && (
          <Section title="💰 FINAL TOTALS">
            {people.map((p, i) => (
              <div key={p} style={{
                background: "#16213e",
                border: `2px solid ${COLORS[i % COLORS.length]}`,
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: COLORS[i % COLORS.length] }}>{p}</span>
                  <span style={{
                    fontSize: 22, fontWeight: 900,
                    color: "#FFD93D",
                  }}>{fmt(totals[p] || 0)}</span>
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {items
                    .filter((item) => item.splits[p])
                    .map((item) => {
                      const count = Object.keys(item.splits).length;
                      const share = (parseFloat(item.price) || 0) / count;
                      return (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span>{item.name}{count > 1 ? ` (÷${count})` : ""}</span>
                          <span style={{ color: "#aaa" }}>{fmt(share)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}

            {/* Receipt tear */}
            <div style={{
              marginTop: 20,
              borderTop: "2px dashed #333",
              paddingTop: 20,
              textAlign: "center",
              color: "#555",
              fontSize: 12,
              letterSpacing: "0.1em",
            }}>
              THANK YOU · COME AGAIN · SPLIT THE BILL
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.15em",
        color: "#e94560",
        marginBottom: 12,
        textTransform: "uppercase",
      }}>{title}</div>
      {children}
    </div>
  );
}

function AddButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "#e94560",
      border: "none",
      color: "#fff",
      borderRadius: 10,
      width: 44,
      height: 44,
      fontSize: 22,
      cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      fontWeight: 900,
    }}>+</button>
  );
}

function SliderField({ label, value, onChange, max, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
        <span style={{ color: "#aaa" }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}%</span>
      </div>
      <input
        type="range" min={0} max={max} step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: color }}
      />
    </div>
  );
}

const inputStyle = {
  background: "#16213e",
  border: "1px solid #0f3460",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#f0ebe3",
  fontFamily: "'Courier New', monospace",
  fontSize: 14,
  outline: "none",
  flex: 1,
};

const miniBtn = {
  border: "none", borderRadius: 6, padding: "4px 8px",
  fontSize: 11, fontWeight: 700, cursor: "pointer",
  fontFamily: "'Courier New', monospace",
};

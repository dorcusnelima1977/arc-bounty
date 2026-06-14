"use client";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, isAddress } from "viem";
import { Shell15, Brand } from "./shells";
import { DefiPanel } from "./DefiPanel";
const addr = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0") as `0x${string}`;
const abi = [
  { name: "post", type: "function", stateMutability: "payable", inputs: [{ name: "desc", type: "string" }], outputs: [{ type: "uint256" }] },,  { name: "submit", type: "function", stateMutability: "nonpayable", inputs: [{ name: "bountyId", type: "uint256" }, { name: "proof", type: "string" }], outputs: [{ type: "uint256" }] },,  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "subId", type: "uint256" }], outputs: [] },,  { name: "get", type: "function", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ type: "tuple", components: [{ name: "poster", type: "address" }, { name: "desc", type: "string" }, { name: "reward", type: "uint256" }, { name: "open", type: "bool" }, { name: "winner", type: "address" }] }] },,  { name: "total", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;
const cut = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const money = (w?: bigint) => w === undefined ? "0.00" : Number(formatEther(w)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const brand: Brand = { name: "Arc Bounty", sub: "Reward great work", emoji: "🎯", color: "cyan", font: '"Segoe UI",system-ui,sans-serif', shape: "rounded-md", hero: "Bounties", herosub: "A built-in DeFi pool, right inside." };
function Entry({ id, me, loading, exec }: { id: bigint; me?: string; loading: boolean; exec: (fn: string, args: any[], v?: bigint) => void }) {
  const { data: it } = useReadContract({ address: addr, abi, functionName: "get", args: [id] });
  const [amt, setAmt] = useState("");
  if (!it) return null;
  const done = false;
  return (
    <div className="bg-[var(--card)] border border-[color:var(--cardb)] rounded-[var(--rad)] p-4 space-y-2 hover:border-cyan-500/40 transition-colors">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-md bg-cyan-500/15 grid place-items-center text-lg shrink-0">🎯</div>
        <div className="flex-1 min-w-0"><div className="font-bold text-[color:var(--txt)]">${money(it.reward)}</div><div className="text-[11px] text-[color:var(--mut)] truncate">{it.desc || `#${id}`}</div></div>
        <span className="text-[11px] bg-[var(--ipt)] px-2 py-1 rounded-full shrink-0">{done ? "Done ✓" : "Open"}</span></div>
      {!done && <div className="flex flex-wrap items-center gap-2"></div>}
    </div>
  );
}
export default function App() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState("home");
  const [f, setF] = useState<any>({desc:"",amt:""});
  const { data: count } = useReadContract({ address: addr, abi, functionName: "total" });
  const { writeContract, data: tx, isPending, reset } = useWriteContract();
  const { isSuccess, isLoading: cfm } = useWaitForTransactionReceipt({ hash: tx, query: { enabled: !!tx } });
  useEffect(() => { if (isSuccess) { reset(); setF({desc:"",amt:""}); } }, [isSuccess]); // eslint-disable-line
  const loading = isPending || cfm;
  const n = count !== undefined ? Number(count) : 0;
  const exec = (fn: string, args: any[], v?: bigint) => writeContract({ address: addr, abi, functionName: fn as any, args, value: v });
  return (<Shell15 brand={brand} tabs={[["home", "Bounties"], ["pool", "Liquidity"], ["swap", "Trade"]]} tab={tab} setTab={setTab}>
    {tab === "home" && <div className="space-y-4">
      <div className="bg-[var(--card)] border border-[color:var(--cardb)] rounded-[var(--rad)] p-6 space-y-3">
        <input value={f.desc} onChange={e=>setF(v=>({...v,desc:e.target.value}))} placeholder="Bounty description" type="text" className="w-full bg-[var(--ipt)] border border-[color:var(--iptb)] rounded-[var(--rad)] px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500" />
        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--mut)]">$</span><input value={f.amt} onChange={e=>setF(v=>({...v,amt:e.target.value}))} type="number" placeholder="USDC amount" className="w-full bg-[var(--ipt)] border border-[color:var(--iptb)] rounded-[var(--rad)] pl-7 pr-3 py-2.5 text-sm focus:outline-none" /></div>
        <button onClick={() => exec("post", [f.desc], parseEther(f.amt||"0"))} disabled={!isConnected || loading || (!(Number(f.amt)>0))} className="w-full py-3 font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:opacity-90 disabled:opacity-40">{loading ? "…" : "Post bountie 🎯"}</button>
      </div>
      {n > 0 ? <div className="space-y-3">{Array.from({ length: n }, (_, i) => BigInt(n - 1 - i)).map(id => <Entry key={id.toString()} id={id} me={address} loading={loading} exec={exec} />)}</div> : <div className="text-center text-sm text-[color:var(--mut)] py-8">Nothing yet 🎯</div>}
    </div>}
    {tab === "pool" && <DefiPanel color="cyan" show={["pool"]} bar note="On-chain swaps and a yield vault, powered by Arc." />}
    {tab === "swap" && <DefiPanel color="cyan" show={["swap"]} bar note="On-chain swaps and a yield vault, powered by Arc." />}
  </Shell15>);
}
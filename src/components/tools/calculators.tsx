"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Tab = "bmi" | "bodyfat" | "calorie";

const tabs: { id: Tab; label: string }[] = [
  { id: "bmi", label: "BMI" },
  { id: "bodyfat", label: "Body Fat" },
  { id: "calorie", label: "Calories" },
];

export function Calculators() {
  const [tab, setTab] = React.useState<Tab>("bmi");
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-surface/60 p-8">
        {tab === "bmi" && <BmiCalc />}
        {tab === "bodyfat" && <BodyFatCalc />}
        {tab === "calorie" && <CalorieCalc />}
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <input
        className="h-11 rounded-xl border border-border bg-background px-4 text-foreground outline-none focus:border-primary"
        {...props}
      />
    </label>
  );
}

function Select({
  label,
  children,
  ...props
}: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <select
        className="h-11 rounded-xl border border-border bg-background px-4 text-foreground outline-none focus:border-primary"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

function Result({ value, unit, note }: { value: string; unit?: string; note?: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
      <div className="font-display text-5xl text-primary">
        {value}
        {unit && <span className="ml-1 text-xl text-muted">{unit}</span>}
      </div>
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </div>
  );
}

function BmiCalc() {
  const [h, setH] = React.useState("170");
  const [w, setW] = React.useState("70");
  const height = parseFloat(h) / 100;
  const weight = parseFloat(w);
  const bmi = height > 0 && weight > 0 ? weight / (height * height) : 0;
  const category =
    bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy weight" : bmi < 30 ? "Overweight" : "Obese";
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Height (cm)" type="number" value={h} onChange={(e) => setH(e.target.value)} />
        <Field label="Weight (kg)" type="number" value={w} onChange={(e) => setW(e.target.value)} />
      </div>
      {bmi > 0 && <Result value={bmi.toFixed(1)} note={category} />}
    </div>
  );
}

function BodyFatCalc() {
  // US Navy method
  const [sex, setSex] = React.useState("male");
  const [height, setHeight] = React.useState("175");
  const [neck, setNeck] = React.useState("38");
  const [waist, setWaist] = React.useState("85");
  const [hip, setHip] = React.useState("95");

  const H = parseFloat(height);
  const N = parseFloat(neck);
  const Wa = parseFloat(waist);
  const Hi = parseFloat(hip);

  let bf = 0;
  if (H > 0 && N > 0 && Wa > 0) {
    if (sex === "male") {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(Wa - N) + 0.15456 * Math.log10(H)) - 450;
    } else if (Hi > 0) {
      bf = 495 / (1.29579 - 0.35004 * Math.log10(Wa + Hi - N) + 0.221 * Math.log10(H)) - 450;
    }
  }
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Sex" value={sex} onChange={(e) => setSex(e.target.value)}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
        <Field label="Height (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
        <Field label="Neck (cm)" type="number" value={neck} onChange={(e) => setNeck(e.target.value)} />
        <Field label="Waist (cm)" type="number" value={waist} onChange={(e) => setWaist(e.target.value)} />
        {sex === "female" && (
          <Field label="Hip (cm)" type="number" value={hip} onChange={(e) => setHip(e.target.value)} />
        )}
      </div>
      {bf > 0 && Number.isFinite(bf) && (
        <Result value={bf.toFixed(1)} unit="%" note="Estimated body fat (US Navy method)" />
      )}
    </div>
  );
}

function CalorieCalc() {
  // Mifflin-St Jeor
  const [sex, setSex] = React.useState("male");
  const [age, setAge] = React.useState("28");
  const [height, setHeight] = React.useState("175");
  const [weight, setWeight] = React.useState("72");
  const [activity, setActivity] = React.useState("1.55");

  const A = parseFloat(age);
  const H = parseFloat(height);
  const W = parseFloat(weight);
  const act = parseFloat(activity);
  let tdee = 0;
  if (A > 0 && H > 0 && W > 0) {
    const bmr = 10 * W + 6.25 * H - 5 * A + (sex === "male" ? 5 : -161);
    tdee = bmr * act;
  }
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Sex" value={sex} onChange={(e) => setSex(e.target.value)}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
        <Field label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        <Field label="Height (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
        <Field label="Weight (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <Select label="Activity level" value={activity} onChange={(e) => setActivity(e.target.value)}>
          <option value="1.2">Sedentary</option>
          <option value="1.375">Lightly active</option>
          <option value="1.55">Moderately active</option>
          <option value="1.725">Very active</option>
          <option value="1.9">Athlete</option>
        </Select>
      </div>
      {tdee > 0 && (
        <>
          <Result value={Math.round(tdee).toString()} unit="kcal" note="Maintenance calories per day" />
          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="font-display text-2xl text-foreground">{Math.round(tdee - 500)}</div>
              <div className="text-muted">Fat loss (kcal)</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="font-display text-2xl text-foreground">{Math.round(tdee + 300)}</div>
              <div className="text-muted">Muscle gain (kcal)</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

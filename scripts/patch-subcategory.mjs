import fs from "fs";

const path = "src/app/components/Subcategory.tsx";
let content = fs.readFileSync(path, "utf8");

const replacements = [
  [
    'className="screen bg-background flex flex-col"',
    'className="screen bg-[#F0F4F2] flex flex-col overflow-hidden"',
  ],
  [
    'className="bg-card border-b border-border p-3 sm:p-4 shrink-0"',
    'className="shrink-0 bg-white border-b px-4 py-3" style={{ borderColor: BORDER }}',
  ],
  [
    'className="screen-scroll flex-1 min-h-0 pb-20"',
    'className="flex-1 min-h-0 overflow-y-auto"',
  ],
  [
    `<button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />`,
    `<button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-[#F0F4F2] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: GREEN_DARK }} />`,
  ],
  [
    '<h1 className="text-xl font-bold flex-1">{category}</h1>',
    '<h1 className="text-[17px] font-bold flex-1 truncate" style={{ color: GREEN_DARK }}>{category}</h1>',
  ],
  [
    '<h2 className="font-semibold text-base mb-3 text-primary">Personal Use</h2>',
    '<h2 className="font-bold text-[15px] mb-3" style={{ color: GREEN }}>Personal Use</h2>',
  ],
  [
    '<h2 className="font-semibold text-base mb-3 text-accent">Professional Use</h2>',
    '<h2 className="font-bold text-[15px] mb-3" style={{ color: GREEN_DARK }}>Professional Use</h2>',
  ],
];

for (const [from, to] of replacements) {
  content = content.replace(from, to);
}

content = content.replace(
  /{personalSubcategories\.map\(\(sub\) => \([\s\S]*?\)\)}/,
  `{personalSubcategories.map((sub) => (
                  <SubcategoryCard
                    key={sub.id}
                    emoji={sub.emoji}
                    label={sub.label}
                    onClick={() => setSelectedSubcategory(sub.id)}
                  />
                ))}`
);

content = content.replace(
  /{professionalSubcategories\.map\(\(sub\) => \([\s\S]*?\)\)}/,
  `{professionalSubcategories.map((sub) => (
                  <SubcategoryCard
                    key={sub.id}
                    emoji={sub.emoji}
                    label={sub.label}
                    onClick={() => setSelectedSubcategory(sub.id)}
                  />
                ))}`
);

content = content.replace(
  /      <div className="screen-footer bg-card border-t border-border px-4 sm:px-6 py-3 flex items-center justify-around">[\s\S]*?      <\/div>\n    <\/div>\n  \);\n}/,
  `      <BottomNav activeTab="none" onHome={onBack} onPostRequest={onPostRequest} />\n    </div>\n  );\n}`
);

fs.writeFileSync(path, content);
console.log("patched subcategory");

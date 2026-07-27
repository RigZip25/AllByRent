import { useState } from "react";
import { useParams } from "react-router";
import { Button } from "../components/Button";
import { BackHeader } from "../components/Chrome";
import { ProgressBar, SectionLabel } from "../components/Ui";
import { useMftStore } from "../store";

export function GroupScreen() {
  const { id = "" } = useParams();
  const trip = useMftStore((s) => s.trips.find((t) => t.id === id));
  const updateTrip = useMftStore((s) => s.updateTrip);
  const [invite, setInvite] = useState("");
  const [chat, setChat] = useState("");

  if (!trip) {
    return (
      <div className="mft-screen">
        <BackHeader title="Группа" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mft-scroll flex-1 px-6 pt-6 pb-4">
        <BackHeader title="Группа" />

        <section className="mb-6">
          <SectionLabel>Пригласить</SectionLabel>
          <div className="flex gap-2">
            <input
              value={invite}
              onChange={(e) => setInvite(e.target.value)}
              placeholder="Email или телефон"
              className="h-11 flex-1 rounded-full bg-[var(--bg-input)] px-4 text-[14px] outline-none ring-1 ring-white/5"
            />
            <Button
              className="h-11 !px-4 text-[13px]"
              disabled={!invite.trim()}
              onClick={() => {
                updateTrip(trip.id, {
                  members: [
                    ...trip.members,
                    {
                      id: `m-${Date.now()}`,
                      name: invite.split("@")[0] || "Гость",
                      role: "guest",
                      interests: ["Новичок"],
                      packingProgress: 0,
                      avatarColor: "#8a877c",
                    },
                  ],
                  activityFeed: [
                    {
                      id: `a-${Date.now()}`,
                      userName: "Вы",
                      type: "member",
                      content: `Приглашение отправлено: ${invite}`,
                      createdAt: "Только что",
                    },
                    ...trip.activityFeed,
                  ],
                });
                setInvite("");
              }}
            >
              Invite
            </Button>
          </div>
        </section>

        <section className="mb-6">
          <SectionLabel>Участники</SectionLabel>
          <div className="space-y-3">
            {trip.members.map((m) => (
              <div key={m.id} className="rounded-[12px] bg-[var(--bg-card)] p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold text-[var(--text-inverse)]"
                    style={{ background: m.avatarColor }}
                  >
                    {m.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium">{m.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] capitalize">
                      {m.role}
                    </div>
                  </div>
                  <div className="text-[12px] text-[var(--accent-gold)]">
                    {m.packingProgress}%
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.interests.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--text-muted)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <ProgressBar value={m.packingProgress} className="mt-3" />
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>Лента</SectionLabel>
          <div className="space-y-2">
            {trip.activityFeed.map((a) => (
              <div
                key={a.id}
                className="rounded-[12px] bg-[var(--bg-card)] px-4 py-3"
              >
                <div className="flex justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                  <span
                    className={
                      a.type === "ai" ? "text-[var(--accent-gold)]" : undefined
                    }
                  >
                    {a.userName}
                  </span>
                  <span>{a.createdAt}</span>
                </div>
                <p className="mt-1 text-[13px]">{a.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-white/5 px-4 pt-3 pb-[calc(12px+var(--safe-bottom))]">
        <div className="flex gap-2">
          <input
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            placeholder="Сообщение группе…"
            className="h-11 flex-1 rounded-full bg-[var(--bg-input)] px-4 text-[14px] outline-none ring-1 ring-white/5"
            onKeyDown={(e) => {
              if (e.key === "Enter" && chat.trim()) {
                updateTrip(trip.id, {
                  activityFeed: [
                    {
                      id: `a-${Date.now()}`,
                      userName: "Вы",
                      type: "member",
                      content: chat.trim(),
                      createdAt: "Только что",
                    },
                    ...trip.activityFeed,
                  ],
                });
                setChat("");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

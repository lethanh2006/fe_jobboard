import type { Metadata } from "next";
import { CandidateProfileForm } from "@/components/candidate-profile-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCandidateProfile } from "@/lib/api";
import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Hồ sơ ứng viên",
};

export default async function CandidateProfilePage() {
  const session = await requireRole("Candidate", "/ung-vien/ho-so");
  const profile = await getCandidateProfile(session.user.id, session.accessToken);

  return (
    <>
      <SiteHeader user={session.user} />
      <main className="profile-page">
        <section className="account-heading">
          <div className="shell">
            <span className="section-kicker">Hồ sơ ứng viên</span>
            <h1>Kể câu chuyện nghề nghiệp của bạn</h1>
            <p>Thông tin này được dùng để tính độ phù hợp với từng công việc.</p>
          </div>
        </section>
        <div className="shell profile-content">
          <CandidateProfileForm profile={profile} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

// src/components/widgets/user/user.jsx
import { useTranslation } from "next-i18next";
import { useCallback } from "react";
import useSWR from "swr";

import Container from "../widget/container";
import ContainerButton from "../widget/container_button";
import Error from "../widget/error";
import PrimaryText from "../widget/primary_text";
import SecondaryText from "../widget/secondary_text";
import WidgetIcon from "../widget/widget_icon";

import { MdLogin, MdPerson } from "react-icons/md";

/* -------------------------------------------------
   Helper sub‑components
   ------------------------------------------------- */
function Avatar({ url, name }) {
  return (
    <img
      src={url}
      alt={name}
      className="avatar"
      style={{
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "9999px",
        objectFit: "cover",
      }}
    />
  );
}

/* -------------------------------------------------
   Main widget
   ------------------------------------------------- */
export default function UserWidget({ options }) {
  const { t } = useTranslation();

  /* ---- Hooks – always called in the same order ---- */
  // SWR key is null while we are waiting for the first render;
  // this prevents a “conditional hook” problem.
  const { data, error } = useSWR(`/api/widgets/user`, {
    revalidateOnFocus: false,
  });

  const handleLogin = useCallback(() => {
    // Replace with your actual auth flow (e.g. next‑auth signIn())
    window.location.href = "/api/auth/login";
  }, []);

  /* ---- Rendering logic ---- */
  // 1️⃣ Error state
  if (error || data?.error) {
    return <Error options={options} />;
  }

  // 2️⃣ Loading state (no data yet)
  if (!data) {
    return (
      <ContainerButton
        options={options}
        callback={() => {}}
        additionalClassNames="information-widget-user-loading"
      >
        <PrimaryText>{t("user.loading") ?? "Loading…"}</PrimaryText>
        <SecondaryText>{t("common.wait") ?? "Please wait"}</SecondaryText>
        <WidgetIcon icon={MdPerson} size="m" pulse />
      </ContainerButton>
    );
  }

  // 3️⃣ Logged‑in user
  if (data.user) {
    const { name, avatarUrl } = data.user;
    return (
      <Container
        options={options}
        additionalClassNames="information-widget-user"
      >
        <PrimaryText>{name}</PrimaryText>
        {(avatarUrl && <Avatar url={avatarUrl} name={name} />) || (
          <WidgetIcon icon={MdPerson} size="m" />
        )}
      </Container>
    );
  }

  // 4️⃣ No user – show login button
  return (
    <ContainerButton
      options={options}
      callback={handleLogin}
      additionalClassNames="information-widget-user-login"
    >
      <PrimaryText>{options.label ?? t("user.login") ?? "Login"}</PrimaryText>
      <SecondaryText>
        {options.subLabel ?? t("user.loginPrompt") ?? "Sign in to continue"}
      </SecondaryText>
      <WidgetIcon icon={MdLogin} size="m" pulse />
    </ContainerButton>
  );
}

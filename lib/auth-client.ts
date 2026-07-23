"use client";

export const logOut = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.setItem("loggedIn", "false");
    window.location.reload();
  }
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("loggedIn") === "true" && localStorage.getItem("user") !== null;
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user");
};

export const setUser = (user: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", user);
    localStorage.setItem("loggedIn", "true");
  }
};

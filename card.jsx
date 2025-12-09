import React from "react";

export const Card = ({ children, className }) => (
  <div className={`p-4 rounded ${className || ""}`}>{children}</div>
);

export const CardHeader = ({ children }) => (
  <div className="mb-2 font-bold">{children}</div>
);

export const CardTitle = ({ children }) => <h3>{children}</h3>;

export const CardContent = ({ children }) => <div>{children}</div>;

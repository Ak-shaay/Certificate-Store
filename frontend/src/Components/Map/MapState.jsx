import React, { useEffect, useState } from "react";
import useSWR from "swr";
import Highmaps from "highcharts/highmaps";
import Highcharts from "highcharts";
import { domain } from "../../Context/config";
import {
  Box,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Button } from "@mui/material";
import Typography from "@mui/material/Typography";
import {
  HighchartsMapChart,
  HighmapsProvider,
  Title,
  Tooltip,
  MapSeries,
  MapNavigation,
  Credits,
  ColorAxis,
} from "react-jsx-highmaps";
import { Pane, Chart } from "react-jsx-highcharts";

const caColorMap = {
  "CCA India 2022": "#ff7c43", // Based on CA1
  Safescrypt: "#f95d6a", // Based on CA2
  IDRBT: "#d45087", // Based on CA3
  "(n)Code Solutions": "#a05195", // Based on RADHERADHE
  "e-Mudhra": "#a1ff33", // Based on CA5
  CDAC: "#ff7c43", // Repeat CA1
  Capricorn: "#f95d6a", // Repeat CA2
  "Protean (NSDL e-Gov)": "#d45087", // Repeat CA3
  "Vsign (Verasys)": "#a05195", // Repeat RADHERADHE
  "Indian Air Force": "#a1ff33", // Repeat CA5
  CSC: "#ff7c43", // Repeat CA1
  "RISL (RajComp)": "#f95d6a", // Repeat CA2
  "Indian Army": "#d45087", // Repeat CA3
  IDSign: "#a05195", // Repeat RADHERADHE
  "CDSL Ventures": "#a1ff33", // Repeat CA5
  "Panta Sign": "#ff7c43", // Repeat CA1
  "xtra Trust": "#f95d6a", // Repeat CA2
  "Indian Navy": "#d45087", // Repeat CA3
  ProDigiSign: "#a05195", // Repeat RADHERADHE
  SignX: "#a1ff33", // Repeat CA5
  JPSL: "#ff7c43", // Repeat CA1
  "Care 4 Sign": "#f95d6a", // Repeat CA2
  IGCAR: "#d45087", // Repeat CA3
  "Speed Signa": "#a05195", // Repeat RADHERADHE
};

// Updated HoverInfoPanel component for the district view
const InstructionsPanel = () => {
  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid rgba(99, 102, 241, 0.2)",
        borderRadius: 2,
        background:
          "linear-gradient(135deg,rgb(0, 0, 0) 0%, #f7f7f7 20%, #f1f5f9 100%)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        backdropFilter: "blur(10px)",
        height: "fit-content",
        minHeight: "100px",
        width: "95%",
        maxWidth: "400px",
        "@media (hover: hover)": {
          "&:hover": {
            transform: "translateY(-2px) scale(1.01)",
            boxShadow:
              "0 12px 24px rgba(99, 102, 241, 0.12), 0 0 30px rgba(139, 92, 246, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            background:
              "linear-gradient(135deg, #fefefe 0%, #f8fafc 20%, #f1f5f9 100%)",
          },
        },
        boxShadow:
          "0 4px 12px rgba(99, 102, 241, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
          transition: "left 0.8s ease-in-out",
        },
        "@media (hover: hover)": {
          "&:hover::before": {
            left: "100%",
          },
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: "8px",
          right: "12px",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgb(255, 0, 0) 0%,rgb(255, 0, 0) 100%)",
          animation: "gentlePulse 3s ease-in-out infinite",
          boxShadow: "0 0 12px rgba(139, 92, 246, 0.5)",
        },
        "@keyframes gentlePulse": {
          "0%, 100%": {
            opacity: 0.6,
            transform: "scale(1)",
            boxShadow: "0 0 12px rgba(139, 92, 246, 0.3)",
          },
          "50%": {
            opacity: 1,
            transform: "scale(1.2)",
            boxShadow: "0 0 18px rgba(139, 92, 246, 0.6)",
          },
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #10b981 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            position: "relative",
            boxShadow:
              "0 3px 10px rgba(139, 92, 246, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.4)",
            animation: "iconFloat 4s ease-in-out infinite",
            "&::before": {
              content: '""',
              position: "absolute",
              width: "120%",
              height: "120%",
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15), rgba(139, 92, 246, 0.15))",
              animation: "rotate 6s linear infinite",
              zIndex: -1,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7) 0%, transparent 70%)",
            },
            "@keyframes iconFloat": {
              "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
              "25%": { transform: "translateY(-1px) rotate(0.5deg)" },
              "50%": { transform: "translateY(0px) rotate(0deg)" },
              "75%": { transform: "translateY(-0.5px) rotate(-0.5deg)" },
            },
            "@keyframes rotate": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        >
          💡
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: "14px",
            fontWeight: "700",
            background:
              "linear-gradient(135deg, #4c1d95 0%, #1e40af 50%, #0891b2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
            letterSpacing: "0.3px",
          }}
        >
          Instructions
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography
          variant="body2"
          sx={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.4 }}
        >
          <strong style={{ color: "#374151" }}>Click:</strong> View CA
          distribution
        </Typography>

        <Typography
          variant="body2"
          sx={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.4 }}
        >
          <strong style={{ color: "#374151" }}>Hover:</strong> State details
        </Typography>
      </Box>
    </Box>
  );
};
const HoverInfoPanel = ({ districtData }) => {
  if (!districtData) {
    return (
      <Box
        sx={{
          p: { xs: 1.5, sm: 2.5, md: 3 },
          border: "2px solid rgba(180, 232, 255, 0.3)",
          borderRadius: { xs: 2, sm: 3, md: 4 },
          background:
            "linear-gradient(135deg, #4691C3 0%, #8D9CFD 50%, #B4E8FF 100%)",
          height: { xs: "160px", sm: "200px", md: "100%" },
          minHeight: { xs: "140px", sm: "180px", md: "200px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow:
            "0 8px 32px rgba(70, 145, 195, 0.2), 0 4px 16px rgba(141, 156, 253, 0.15)",
          transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          "&:hover": {
            transform: "translateY(-3px) scale(1.01)",
            boxShadow:
              "0 16px 48px rgba(70, 145, 195, 0.3), 0 8px 24px rgba(141, 156, 253, 0.25)",
            border: "2px solid rgba(180, 232, 255, 0.5)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            backdropFilter: "blur(15px)",
            borderRadius: { xs: 2, sm: 3, md: 4 },
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background:
              "conic-gradient(from 0deg, transparent, rgba(255, 202, 113, 0.1), transparent)",
            animation: "rotate 8s linear infinite",
            "@keyframes rotate": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            zIndex: 2,
            color: "white",
            px: 1,
          }}
        >
          <Box
            sx={{
              width: { xs: 50, sm: 65, md: 70 },
              height: { xs: 50, sm: 65, md: 70 },
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(255, 202, 113, 0.3) 0%, rgba(253, 146, 157, 0.3) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: {
                xs: "0 auto 12px",
                sm: "0 auto 16px",
                md: "0 auto 20px",
              },
              animation: "float 3s ease-in-out infinite",
              fontSize: { xs: "20px", sm: "26px", md: "30px" },
              border: "2px solid rgba(255, 255, 255, 0.2)",
              boxShadow:
                "0 8px 24px rgba(0, 0, 0, 0.1), inset 0 2px 8px rgba(255, 255, 255, 0.2)",
              "@keyframes float": {
                "0%, 100%": { transform: "translateY(0px) scale(1)" },
                "50%": { transform: "translateY(-8px) scale(1.05)" },
              },
            }}
          >
            🗺️
          </Box>
          <p
            style={{
              margin: 0,
              fontSize: "clamp(13px, 3.8vw, 18px)",
              fontWeight: "600",
              textShadow:
                "0 3px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)",
              padding: "0 12px",
              lineHeight: 1.4,
              letterSpacing: "0.3px",
            }}
          >
            Hover over a state to explore certificate distribution
          </p>
        </Box>
      </Box>
    );
  }

  // Filter out state and color properties and non-numeric values
  const caData = Object.entries(districtData)
    .filter(
      ([key, value]) =>
        key !== "state" &&
        key !== "color" &&
        typeof value === "number" &&
        value > 0
    )
    .sort((a, b) => b[1] - a[1]); // Sort by value in descending order

  const totalCertificates = caData.reduce((sum, [_, value]) => sum + value, 0);

  return (
    <Box
      sx={{
        p: 0,
        border: "2px solid rgba(180, 232, 255, 0.2)",
        borderRadius: { xs: 2, sm: 3, md: 4 },
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8fbff 50%, #f0f8ff 100%)",
        height: {
          xs: "auto",
          sm: "400px",
          md: "450px",
        },
        maxHeight: { xs: "75vh", sm: "400px", md: "450px" },
        minHeight: { xs: "300px", sm: "350px", md: "400px" },
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow:
          "0 12px 40px rgba(70, 145, 195, 0.15), 0 6px 16px rgba(141, 156, 253, 0.1)",
        transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        overflow: "hidden",
        "&:hover": {
          transform: {
            xs: "translateY(-2px)",
            sm: "translateY(-4px)",
            md: "translateY(-6px)",
          },
          boxShadow:
            "0 20px 60px rgba(70, 145, 195, 0.25), 0 10px 24px rgba(141, 156, 253, 0.2)",
          border: "2px solid rgba(180, 232, 255, 0.4)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(45deg, rgba(255, 202, 113, 0.02) 0%, rgba(253, 146, 157, 0.02) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #4691C3 0%, #8D9CFD 50%, #FD929D 100%)",
          p: { xs: 1.5, sm: 2.5, md: 3 },
          color: "white",
          position: "relative",
          flexShrink: 0,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
            animation: "shimmer 3s ease-in-out infinite",
            "@keyframes shimmer": {
              "0%": { left: "-100%" },
              "100%": { left: "100%" },
            },
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: { xs: "3px", sm: "4px", md: "5px" },
            background:
              "linear-gradient(90deg, #FFCA71 0%, #FD929D 25%, #4691C3 50%, #B4E8FF 75%, #8D9CFD 100%)",
            animation: "colorShift 4s ease-in-out infinite",
            "@keyframes colorShift": {
              "0%, 100%": { opacity: 0.8 },
              "50%": { opacity: 1 },
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5, md: 2 },
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: { xs: 32, sm: 42, md: 48 },
              height: { xs: 32, sm: 42, md: 48 },
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(255, 202, 113, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: { xs: "14px", sm: "18px", md: "22px" },
              border: "2px solid rgba(255, 255, 255, 0.3)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
              animation: "bounce 2s ease-in-out infinite",
              "@keyframes bounce": {
                "0%, 100%": { transform: "translateY(0px)" },
                "50%": { transform: "translateY(-3px)" },
              },
            }}
          >
            📍
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                margin: 0,
                fontSize: "clamp(16px, 4.5vw, 24px)",
                fontWeight: "700",
                textShadow:
                  "0 3px 6px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)",
                lineHeight: 1.2,
                wordBreak: "break-word",
                letterSpacing: "0.5px",
              }}
            >
              {districtData.state}
            </h3>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "clamp(11px, 3vw, 16px)",
                opacity: 0.95,
                fontWeight: "500",
                lineHeight: 1.3,
                letterSpacing: "0.2px",
              }}
            >
              Certificate Distribution
            </p>
          </Box>
        </Box>
      </Box>

      {/* Total Count Section */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2.5, md: 3 },
          pb: { xs: 1, sm: 1.5, md: 2 },
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            background:
              "linear-gradient(135deg, #FFCA71 0%, #FD929D 50%, #B4E8FF 100%)",
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            p: { xs: 1.5, sm: 2, md: 2.5 },
            color: "white",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 8px 24px rgba(70, 145, 195, 0.2), inset 0 1px 3px rgba(255, 255, 255, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px) scale(1.02)",
              boxShadow:
                "0 12px 32px rgba(70, 145, 195, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.4)",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-2px",
              left: "-2px",
              right: "-2px",
              bottom: "-2px",
              background:
                "linear-gradient(45deg, #FFCA71, #FD929D, #4691C3, #B4E8FF, #8D9CFD)",
              borderRadius: { xs: 2, sm: 2.5, md: 3 },
              zIndex: -2,
              animation: "borderGlow 3s linear infinite",
              "@keyframes borderGlow": {
                "0%": { opacity: 0.5 },
                "50%": { opacity: 0.8 },
                "100%": { opacity: 0.5 },
              },
            },
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, #FFCA71 0%, #FD929D 50%, #B4E8FF 100%)",
              borderRadius: { xs: 2, sm: 2.5, md: 3 },
              zIndex: -1,
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <p
              style={{
                margin: "0 0 6px 0",
                fontSize: "clamp(10px, 2.8vw, 16px)",
                opacity: 0.9,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: "600",
                lineHeight: 1.2,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              Total Certificates
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "clamp(20px, 5.5vw, 32px)",
                fontWeight: "800",
                textShadow:
                  "0 3px 6px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)",
                lineHeight: 1.1,
                letterSpacing: "0.5px",
              }}
            >
              {totalCertificates.toLocaleString()}
            </p>
          </Box>
        </Box>
      </Box>

      {/* CA Distribution Section */}
      {caData.length > 0 ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              px: { xs: 1.5, sm: 2.5, md: 3 },
              pb: { xs: 0.75, sm: 1, md: 1.25 },
              flexShrink: 0,
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "clamp(13px, 3.2vw, 18px)",
                fontWeight: "700",
                color: "#2d3748",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                lineHeight: 1.3,
                letterSpacing: "0.3px",
              }}
            >
              📈 CA Distribution
            </h4>
          </Box>

          <Box
            sx={{
              px: { xs: 1.5, sm: 2.5, md: 3 },
              pb: { xs: 1.5, sm: 2.5, md: 3 },
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
              "&::-webkit-scrollbar": {
                width: { xs: "4px", sm: "6px", md: "8px" },
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(180, 232, 255, 0.1)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "linear-gradient(135deg, #4691C3 0%, #8D9CFD 100%)",
                borderRadius: "10px",
                transition: "all 0.3s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #3a7ba8 0%, #7a8ae8 100%)",
                },
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1, sm: 1.5, md: 2 },
              }}
            >
              {caData.map(([ca, value], index) => {
                // Calculate percentage based on total certificates, not max value
                const percentage =
                  totalCertificates > 0
                    ? ((value / totalCertificates) * 100).toFixed(1)
                    : 0;
                const colors = [
                  "linear-gradient(135deg, #FFCA71 0%, #ff9a56 100%)",
                  "linear-gradient(135deg, #FD929D 0%, #ff7a8a 100%)",
                  "linear-gradient(135deg, #4691C3 0%, #357abd 100%)",
                  "linear-gradient(135deg, #B4E8FF 0%, #87ceeb 100%)",
                  "linear-gradient(135deg, #8D9CFD 0%, #7b8cfc 100%)",
                ];

                return (
                  <Box
                    key={ca}
                    sx={{
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #fafbff 100%)",
                      borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
                      p: { xs: 1.25, sm: 1.75, md: 2.25 },
                      boxShadow:
                        "0 4px 12px rgba(70, 145, 195, 0.08), 0 2px 4px rgba(141, 156, 253, 0.05)",
                      border: "1px solid rgba(180, 232, 255, 0.2)",
                      transition:
                        "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      position: "relative",
                      overflow: "hidden",
                      animation: `slideIn 0.6s ease-out ${index * 0.1}s both`,
                      "@keyframes slideIn": {
                        "0%": {
                          transform: "translateX(-30px)",
                          opacity: 0,
                        },
                        "100%": {
                          transform: "translateX(0)",
                          opacity: 1,
                        },
                      },
                      "&:hover": {
                        transform: {
                          xs: "translateY(-2px)",
                          sm: "translateY(-3px) translateX(4px)",
                          md: "translateY(-4px) translateX(6px)",
                        },
                        boxShadow:
                          "0 8px 24px rgba(70, 145, 195, 0.15), 0 4px 8px rgba(141, 156, 253, 0.1)",
                        border: "1px solid rgba(180, 232, 255, 0.4)",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: colors[index % colors.length],
                        opacity: 0.03,
                        transition: "opacity 0.3s ease",
                      },
                      "&:hover::before": {
                        opacity: 0.06,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: { xs: 0.75, sm: 1, md: 1.25 },
                        gap: { xs: 0.75, sm: 1, md: 1.25 },
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: { xs: 0.75, sm: 1, md: 1.25 },
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: 10, sm: 13, md: 16 },
                            height: { xs: 10, sm: 13, md: 16 },
                            borderRadius: "50%",
                            background: colors[index % colors.length],
                            flexShrink: 0,
                            mt: { xs: 0.2, sm: 0.3, md: 0.3 },
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                            animation: `pulse 2s ease-in-out infinite ${
                              index * 0.2
                            }s`,
                            "@keyframes pulse": {
                              "0%, 100%": { transform: "scale(1)" },
                              "50%": { transform: "scale(1.1)" },
                            },
                          }}
                        />
                        <span
                          style={{
                            fontSize: "clamp(11px, 3vw, 16px)",
                            fontWeight: "600",
                            color: "#2d3748",
                            lineHeight: "1.4",
                            wordBreak: "break-word",
                            flex: 1,
                            minWidth: 0,
                            letterSpacing: "0.2px",
                          }}
                        >
                          {ca}
                        </span>
                      </Box>
                      <Box
                        sx={{
                          textAlign: "right",
                          flexShrink: 0,
                          minWidth: "fit-content",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "clamp(13px, 3.2vw, 18px)",
                            fontWeight: "700",
                            color: "#1a202c",
                            lineHeight: 1.2,
                            letterSpacing: "0.3px",
                          }}
                        >
                          {value.toLocaleString()}
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(9px, 2.4vw, 14px)",
                            color: "#4a5568",
                            fontWeight: "600",
                            lineHeight: 1.2,
                            letterSpacing: "0.2px",
                          }}
                        >
                          {percentage}%
                        </div>
                      </Box>
                    </Box>

                    {/* Fixed Progress bar */}
                    <Box
                      sx={{
                        width: "100%",
                        height: { xs: 4, sm: 6, md: 8 },
                        backgroundColor: "rgba(180, 232, 255, 0.15)",
                        borderRadius: { xs: 2, sm: 3, md: 4 },
                        overflow: "hidden",
                        position: "relative",
                        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: colors[index % colors.length],
                          borderRadius: { xs: 2, sm: 3, md: 4 },
                          position: "relative",
                          transition:
                            "width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                            animation: "shine 2s ease-in-out infinite",
                            "@keyframes shine": {
                              "0%": { transform: "translateX(-100%)" },
                              "100%": { transform: "translateX(100%)" },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 3 },
            textAlign: "center",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              background:
                "linear-gradient(135deg, #FFCA71 0%, rgba(255, 202, 113, 0.1) 100%)",
              borderRadius: { xs: 2, sm: 2.5, md: 3 },
              p: { xs: 2, sm: 3, md: 4 },
              border: "2px solid rgba(255, 202, 113, 0.3)",
              maxWidth: "100%",
              boxShadow: "0 8px 24px rgba(255, 202, 113, 0.2)",
              animation: "gentle-bounce 3s ease-in-out infinite",
              "@keyframes gentle-bounce": {
                "0%, 100%": { transform: "translateY(0px)" },
                "50%": { transform: "translateY(-5px)" },
              },
            }}
          >
            <Box
              sx={{
                fontSize: { xs: "20px", sm: "26px", md: "30px" },
                mb: { xs: 0.75, sm: 1, md: 1.25 },
                animation: "rotate 4s linear infinite",
                "@keyframes rotate": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            >
              ⚠️
            </Box>
            <p
              style={{
                margin: 0,
                color: "#8b5a00",
                fontWeight: "600",
                fontSize: "clamp(12px, 3vw, 16px)",
                lineHeight: 1.4,
                letterSpacing: "0.3px",
              }}
            >
              No certificates issued in this district
            </p>
          </Box>
        </Box>
      )}
    </Box>
  );
};
// Time period options
const TIME_PERIODS = {
  ALL: 0,
  LAST_6_MONTHS: 1,
  LAST_3_MONTHS: 2,
  LAST_1_MONTH: 3,
};

const MapState = ({ stateName, selectedTimePeriod = TIME_PERIODS.ALL }) => {
  const [geojson, setGeojson] = useState(null);
  const [mapdata, setMapdata] = useState(null);
  const [filteredMapData, setFilteredMapData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [hoveredStateData, setHoveredStateData] = useState(null);
  const [showIndiaMap, setShowIndiaMap] = useState(false);
  const [localTimePeriod, setLocalTimePeriod] = useState(selectedTimePeriod);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    return res.json();
  };

  const { data: geojsonData, error: geojsonError } = useSWR(
    stateName
      ? (() => {
          // console.log(stateName);
          const url = `http://${domain}:8080/states/${stateName}.json`;
          // console.log("Fetching GeoJSON data from:", url);
          return url;
        })()
      : null,
    fetcher
  );

  const { data: mapdataData, error: mapdataError } = useSWR(
    stateName
      ? (() => {
          // console.log(stateName);
          const url = `http://${domain}:8080/count/${stateName}.json`;
          // console.log("Fetching GeoJSON data from:", url);
          return url;
        })()
      : null,
    fetcher
  );

  // Initialize localTimePeriod when selectedTimePeriod changes
  useEffect(() => {
    setLocalTimePeriod(selectedTimePeriod);
  }, [selectedTimePeriod]);

  // Process the map data based on the selected time period
  const processMapData = (data, timePeriod) => {
    if (!data) return null;

    return data.map((districtData) => {
      // Create a copy of the district data
      const processedDistrictData = { ...districtData };

      // For each CA, update the value based on the selected time period
      Object.keys(districtData).forEach((key) => {
        // Skip non-CA properties
        if (key === "state" || key === "color") return;

        // Check if the CA data is an array
        if (Array.isArray(districtData[key])) {
          // Update value based on selected time period
          processedDistrictData[key] = districtData[key][timePeriod];
        }
      });

      return processedDistrictData;
    });
  };

  useEffect(() => {
    if (geojsonData) setGeojson(geojsonData);
    if (mapdataData) {
      setMapdata(mapdataData);
      setFilteredMapData(processMapData(mapdataData, localTimePeriod));
    }
  }, [geojsonData, mapdataData]);

  // Update filtered data when time period changes
  useEffect(() => {
    if (mapdata) {
      setFilteredMapData(processMapData(mapdata, localTimePeriod));
    }
  }, [localTimePeriod, mapdata]);

  const handleTimePeriodChange = (event) => {
    setLocalTimePeriod(parseInt(event.target.value));
  };

  if (geojsonError || mapdataError) return <div>Error loading map data.</div>;
  if (!geojson || !filteredMapData) return <div>Loading...</div>;

  const totalCount = filteredMapData.reduce((sum, item) => {
    return (
      sum +
      Object.keys(item)
        .filter(
          (key) =>
            key !== "state" && key !== "color" && typeof item[key] === "number"
        )
        .reduce((acc, key) => acc + (item[key] || 0), 0)
    );
  }, 0);

  // Function to generate a blue color gradient based on value
  const getBlueGradientColor = (value, maxValue) => {
    // Set a default maxValue if it's not provided or is zero
    const effectiveMaxValue = maxValue <= 0 ? 1 : maxValue;

    // Normalize the value between 0 and 1
    const normalizedValue = value / effectiveMaxValue;

    // Create a blue color gradient from light to dark
    // Using a more visually appealing blue gradient
    const r = Math.round(240 - normalizedValue * 220); // Decrease red
    const g = Math.round(248 - normalizedValue * 230); // Decrease green
    const b = Math.round(255 - normalizedValue * 70); // Slight decrease in blue for darker blues

    return `rgb(${r}, ${g}, ${b})`;
  };

  const seriesData = filteredMapData.map((item) => {
    const totalValue = Object.keys(item)
      .filter(
        (key) =>
          key !== "state" && key !== "color" && typeof item[key] === "number"
      )
      .reduce((sum, key) => sum + (item[key] || 0), 0);

    return {
      district: item.state,
      value: totalValue,
      // Remove the color property - Highcharts will color based on colorAxis
    };
  });

  const joinBy = "district"; // Add this definition near your plotOptions and colorAxis variables

  const plotOptions = {
    map: {
      allAreas: true,
      joinBy: joinBy,
      dataLabels: {
        enabled: true,
        format: `{point.${joinBy}}: {point.value}`,
      },
    },
  };

  const colorAxis = {
    min: 0,
    max: totalCount / 10,
    stops: [
      [0, "#ffa600"],
      [0.14, "#ff7c43"],
      [0.28, "#f95d6a"],
      [0.42, "#d45087"],
      [0.57, "#a05195"],
      [0.71, "#665191"],
      [0.85, "#2f4b7c"],
      [1, "#003f5c"],
    ],
  };

  const handleStateClick = (districtName) => {
    const districtData = filteredMapData.find(
      (item) => item.state === districtName
    );
    if (!districtData) return;

    const pieChartData = Object.keys(districtData)
      .filter(
        (key) =>
          key !== "state" &&
          key !== "color" &&
          typeof districtData[key] === "number" &&
          districtData[key] > 0
      )
      .map((ca) => ({
        name: ca,
        y: districtData[ca],
        color: caColorMap[ca] || districtData.color || "#ccc",
      }));

    setPieData({ districtName, pieChartData });
    displayPieChart(districtName);
  };

  const displayPieChart = (districtName) => {
    const districtData = filteredMapData.find(
      (item) => item.state === districtName
    );
    if (!districtData) return;

    const pieChartData = Object.keys(districtData)
      .filter(
        (key) =>
          key !== "state" &&
          key !== "color" &&
          typeof districtData[key] === "number" &&
          districtData[key] > 0
      )
      .map((ca) => ({
        name: ca,
        y: districtData[ca],
        color: caColorMap[ca] || districtData.color || "#ccc",
      }));

    if (pieChartData.length === 0) return; // Avoid rendering an empty pie chart

    let pieContainer = document.getElementById("popup-pie-container");
    if (!pieContainer) {
      pieContainer = document.createElement("div");
      pieContainer.id = "popup-pie-container";
      document.body.appendChild(pieContainer);
    } else {
      pieContainer.innerHTML = "";
    }

    // Use MUI's Box for responsive styling
    pieContainer.innerHTML = `
      <div id="popup-pie-container-inner" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
        z-index: 1000;
        overflow: auto;
        padding: 20px;
      ">
        <button id="close-pie" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 5px 10px;
          cursor: pointer;
          font-size: 12px;
        ">✖</button>
        <div id="popup-pie" style="margin-top: 20px;"></div>
      </div>
    `;

    const isSmallScreen = window.innerWidth < 600;

    Highcharts.chart("popup-pie", {
      chart: { type: "pie" },
      title: {
        text: `CA Distribution in ${districtName} ${getTimeText(
          localTimePeriod
        )}`,
        style: { fontSize: isSmallScreen ? "16px" : "18px" },
      },
      credits: { enabled: false },
      tooltip: { pointFormat: "{series.name}: <b>{point.y}</b>" },
      series: [
        {
          name: "Certificates Issued",
          data: pieChartData,
        },
      ],
      responsive: {
        rules: [
          {
            condition: { maxWidth: 600 },
            chartOptions: {
              legend: {
                align: "center",
                verticalAlign: "bottom",
                layout: "horizontal",
              },
              title: {
                style: { fontSize: isSmallScreen ? "14px" : "16px" },
              },
            },
          },
        ],
      },
    });

    // Attach close button event listener correctly
    document.getElementById("close-pie").addEventListener("click", () => {
      pieContainer.remove();
    });
  };

  const getTimeText = (timePeriod) => {
    switch (timePeriod) {
      case TIME_PERIODS.LAST_6_MONTHS:
        return "(Last 6 Months)";
      case TIME_PERIODS.LAST_3_MONTHS:
        return "(Last 3 Months)";
      case TIME_PERIODS.LAST_1_MONTH:
        return "(Last Month)";
      default:
        return "(All Time)";
    }
  };

  const totalCountString = `${stateName} Map - Certificates Issued: ${totalCount} ${getTimeText(
    localTimePeriod
  )}`;

  // New function to toggle India Map
  const handleIndiaMapToggle = () => {
    setShowIndiaMap(true);
  };

  // If showIndiaMap is true, render the India Map component
  if (showIndiaMap) {
    // Dynamic import of Map component
    const Map = React.lazy(() => import("../Map/Map.jsx")); // Update this import path
    return (
      <React.Suspense fallback={<div>Loading India Map...</div>}>
        <Map selectedTimePeriod={localTimePeriod} />
      </React.Suspense>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexDirection: isSmallScreen ? "column" : "row",
          gap: isSmallScreen ? 2 : 0,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Button
              variant="contained"
              onClick={handleIndiaMapToggle}
              sx={{
                backgroundColor: "#8D9DFE",
                color: "white",
                marginRight: isSmallScreen ? 0 : "1rem",
                marginBottom: isSmallScreen ? "1rem" : 0,
                "&:hover": {
                  backgroundColor: "#7A8BFD",
                },
              }}
            >
              Back to India Map
            </Button>

            <FormControl
              size="small"
              variant="outlined"
              style={{ minWidth: 150 }}
            >
              <InputLabel id="state-time-period-label">Time Period</InputLabel>
              <Select
                labelId="state-time-period-label"
                id="state-time-period-select"
                value={localTimePeriod}
                onChange={handleTimePeriodChange}
                label="Time Period"
              >
                <MenuItem value={TIME_PERIODS.ALL}>All Time</MenuItem>
                <MenuItem value={TIME_PERIODS.LAST_6_MONTHS}>
                  Last 6 Months
                </MenuItem>
                <MenuItem value={TIME_PERIODS.LAST_3_MONTHS}>
                  Last 3 Months
                </MenuItem>
                <MenuItem value={TIME_PERIODS.LAST_1_MONTH}>
                  Last Month
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          gap: 2,
        }}
      >
        {/* Map container */}
        <Box sx={{ flex: isSmallScreen ? 1 : 3 }}>
          <HighmapsProvider Highcharts={Highmaps}>
            <HighchartsMapChart
              map={geojson}
              sx={{
                width: "100%",
                height: isSmallScreen ? 400 : 600,
              }}
            >
              <Chart
                height={isSmallScreen ? 400 : 600}
                backgroundColor="white"
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                }}
              />
              <Title>{totalCountString}</Title>

              <Pane background={{ backgroundColor: "#ffecd1" }} />
              <Tooltip pointFormat="{point.district}: {point.value}" />
              <Credits enabled={false} />
              <MapNavigation>
                <MapNavigation.ZoomIn />
                <MapNavigation.ZoomOut />
              </MapNavigation>
              <ColorAxis
                min={Math.min(...seriesData.map((item) => item.value))}
                max={Math.max(...seriesData.map((item) => item.value))}
                stops={[
                  [0, "#ffa600"],
                  [0.2, "#ff7c43"],
                  [0.4, "#f95d6a"],
                  [0.6, "#d45087"],
                  [0.8, "#a05195"],
                  [1, "#003f5c"],
                ]}
              />
              <MapSeries
                name="Certificates Issued"
                data={seriesData}
                colorAxis={0}
                joinBy="district"
                states={{
                  hover: {
                    color: "#ffecd1",
                  },
                }}
                point={{
                  events: {
                    click: function () {
                      handleStateClick(this.district);
                    },
                    mouseOver: function () {
                      const districtName = this.district;
                      const districtData = filteredMapData.find(
                        (item) => item.state === districtName
                      );
                      setHoveredStateData(districtData);
                    },
                  },
                }}
                dataLabels={{
                  enabled: false,
                  format: "{point.district}: {point.value}",
                }}
                colorByPoint={false}
              />
            </HighchartsMapChart>
          </HighmapsProvider>
        </Box>

        {/* Right sidebar with district info and instructions */}
        <Box
          sx={{
            flex: isSmallScreen ? 1 : 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Hover information panel */}
          <HoverInfoPanel districtData={hoveredStateData} />

          {/* Instructions panel */}
          <InstructionsPanel />
        </Box>
      </Box>
    </div>
  );
};

export default MapState;

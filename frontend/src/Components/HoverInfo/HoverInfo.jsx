import { Box } from "@mui/material";

const HoverInfoPanel = ({
  stateData,
  noDataText = "state",
  nameProperty = "state",
}) => {
  if (!stateData) {
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
  console.log(stateData[nameProperty]);

  // Filter out state and color properties and non-numeric values
  const caData = Object.entries(stateData)
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
              {stateData.state}
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
              No certificates issued in this {noDataText}
            </p>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HoverInfoPanel;

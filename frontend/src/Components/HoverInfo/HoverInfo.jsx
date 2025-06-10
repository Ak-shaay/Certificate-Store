import { Box } from "@mui/material";

const HoverInfoPanel = ({
  stateData,
  noDataText = "state",
  nameProperty = "state",
}) => {
  // Calculate data once to avoid recalculations
  const caData = stateData
    ? Object.entries(stateData)
        .filter(
          ([key, value]) =>
            key !== "state" &&
            key !== "color" &&
            typeof value === "number" &&
            value > 0
        )
        .sort((a, b) => b[1] - a[1])
    : [];

  const totalCertificates = caData.reduce((sum, [_, value]) => sum + value, 0);

  // Fixed container styles that don't change based on content
  const containerStyles = {
    p: 0,
    border: "2px solid rgba(180, 232, 255, 0.2)",
    borderRadius: { xs: 2, sm: 3, md: 4 },
    background:
      "linear-gradient(135deg, #ffffff 0%, #f8fbff 50%, #f0f8ff 100%)",
    // Fixed height that doesn't change
    height: { xs: "400px", sm: "450px", md: "450px" },
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
  };

  if (!stateData) {
    return (
      <Box sx={containerStyles}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%", // Use full height of container
            textAlign: "center",
            color: "white",
            px: 1,
          }}
        >
          <Box>
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
                color: "#4691C3", // Fixed color for better visibility on white background
              }}
            >
              Hover over a state to explore certificate distribution
            </p>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={containerStyles}>
      {/* Header Section - Fixed height */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #4691C3 0%, #8D9CFD 50%, #FD929D 100%)",
          p: { xs: 1.5, sm: 2, md: 2.5 }, // Reduced padding for consistency
          color: "white",
          position: "relative",
          flexShrink: 0,
          overflow: "hidden",
          height: { xs: "80px", sm: "90px", md: "100px" }, // Fixed height
          display: "flex",
          alignItems: "center", // Center content vertically
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
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: { xs: 32, sm: 38, md: 44 }, // Slightly reduced
              height: { xs: 32, sm: 38, md: 44 },
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(255, 202, 113, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: { xs: "14px", sm: "16px", md: "20px" }, // Reduced font size
              border: "2px solid rgba(255, 255, 255, 0.3)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
              flexShrink: 0,
            }}
          >
            📍
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                margin: 0,
                fontSize: "clamp(14px, 4vw, 20px)", // Reduced font size
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
                margin: "2px 0 0 0", // Reduced margin
                fontSize: "clamp(10px, 2.5vw, 14px)", // Reduced font size
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

      {/* Total Count Section - Fixed height */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 }, // Reduced padding
          pb: { xs: 1, sm: 1.5, md: 2 },
          flexShrink: 0,
          display: "flex",
          alignItems: "center", // Center vertically
          height: { xs: "80px", sm: "90px", md: "100px" }, // Fixed height
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
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            "&:hover": {
              transform: "translateY(-2px) scale(1.02)",
              boxShadow:
                "0 12px 32px rgba(70, 145, 195, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.4)",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <p
              style={{
                margin: "0 0 4px 0", // Reduced margin
                fontSize: "clamp(9px, 2.5vw, 14px)", // Reduced font size
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
                fontSize: "clamp(18px, 5vw, 28px)", // Reduced font size
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

      {/* CA Distribution Section - Flexible height with scroll */}
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
              fontSize: "clamp(12px, 3vw, 16px)", // Reduced font size
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

        {caData.length > 0 ? (
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
                      p: { xs: 1.25, sm: 1.5, md: 2 }, // Reduced padding
                      boxShadow:
                        "0 4px 12px rgba(70, 145, 195, 0.08), 0 2px 4px rgba(141, 156, 253, 0.05)",
                      border: "1px solid rgba(180, 232, 255, 0.2)",
                      transition:
                        "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      position: "relative",
                      overflow: "hidden",
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
                            width: { xs: 10, sm: 12, md: 14 }, // Reduced size
                            height: { xs: 10, sm: 12, md: 14 },
                            borderRadius: "50%",
                            background: colors[index % colors.length],
                            flexShrink: 0,
                            mt: { xs: 0.2, sm: 0.3, md: 0.3 },
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "clamp(10px, 2.8vw, 14px)", // Reduced font size
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
                            fontSize: "clamp(12px, 3vw, 16px)", // Reduced font size
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
                            fontSize: "clamp(8px, 2.2vw, 12px)", // Reduced font size
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

                    {/* Progress bar */}
                    <Box
                      sx={{
                        width: "100%",
                        height: { xs: 4, sm: 5, md: 6 }, // Reduced height
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
                            "width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Faster transition
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
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
              }}
            >
              <Box
                sx={{
                  fontSize: { xs: "20px", sm: "24px", md: "28px" }, // Reduced size
                  mb: { xs: 0.75, sm: 1, md: 1.25 },
                }}
              >
                ⚠️
              </Box>
              <p
                style={{
                  margin: 0,
                  color: "#8b5a00",
                  fontWeight: "600",
                  fontSize: "clamp(11px, 2.8vw, 14px)", // Reduced font size
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
    </Box>
  );
};

export default HoverInfoPanel;

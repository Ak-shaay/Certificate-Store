import { Box, Typography } from "@mui/material";

const InstructionsPanel = ({ instructions = [] }) => {
  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid rgba(99, 102, 241, 0.2)",
        borderRadius: 2,
        background:
          "linear-gradient(135deg,rgb(255 246 246) 0%, #f7f7f7 20%, #f1f5f9 100%)",
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
          borderRadius: "75%",
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
        {instructions.map((instruction, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.4 }}
          >
            <strong style={{ color: "#374151" }}>{instruction.action}:</strong>{" "}
            {instruction.description}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default InstructionsPanel;

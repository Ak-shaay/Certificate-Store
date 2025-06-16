import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Container } from "@mui/material";

const Unauthorized = () => {
    const navigate = useNavigate();

    const goBack = () => navigate(-1);

    return (
        <Container maxWidth="sm">
            <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                minHeight="100vh" 
                textAlign="center"
            >
                <Typography variant="h3" component="h1" gutterBottom>
                    Unauthorized
                </Typography>
                <Typography variant="body1" paragraph>
                    You do not have access to the requested page.
                </Typography>
                <Button variant="contained" color="primary" onClick={goBack}>
                    Go Back
                </Button>
            </Box>
        </Container>
    );
};

export default Unauthorized;

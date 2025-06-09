import React from "react";
import { Typography, Box, Paper, Divider, Stack, Avatar } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";

const contacts = [
  {
    name: "Martínez García Luis Gerardo",
    email: "luis.martinez.contacto33@gmail.com",
  },
  {
    name: "Mendoza Berber Amiel Jared",
    email: "danielocity23@gmail.com",
  },
];

const Contact = ({ isDarkMode }) => {
  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 6 }}>
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          borderRadius: 4,
          background: isDarkMode
            ? "linear-gradient(90deg, #232526 0%, #414345 100%)"
            : "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ fontWeight: 700 }}
        >
          Contacto
        </Typography>

        {/* Escudos y texto central */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            my: 2,
            gap: 2,
          }}
        >
          <Box
            sx={{
              minWidth: 100,
              display: { xs: "none", sm: "flex" },
              justifyContent: "center",
            }}
          >
            <img
              src={isDarkMode ? "/escudo-IPN-b.png" : "/escudo-IPN.png"}
              alt="Escudo IPN"
              style={{ width: 55, height: "auto" }}
            />
          </Box>
          <Box sx={{ flex: 1, px: 2 }}>
            <Typography variant="body1" paragraph align="center">
              Esta aplicación web fue diseñada y desarrollada por alumnos del <br/>
              
              <Box
                component="a"
                href="https://www.ipn.mx/sg/conocenos/mision-y-vision.html"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontWeight: 700,
                  color: "#a21caf",
                  textDecoration: "none",
                }}
              >
                Instituto Politécnico Nacional <br/>
              </Box>
              <Box>adscritos a la <br/></Box>
              <Box
                component="a"
                href="https://www.escom.ipn.mx/htmls/conocenos/misionVision.php"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontWeight: 700,
                  color: "#7c3aed",
                  textDecoration: "none",
                }}
              >
                Escuela Superior de Cómputo
              </Box>
              .
            </Typography>
          </Box>
          <Box
            sx={{
              minWidth: 100,
              display: { xs: "none", sm: "flex" },
              justifyContent: "center",
            }}
          >
            <img
              src= {isDarkMode ? "/escudo-ESCOM-b.png" : "/escudo-ESCOM.png"}
              alt="Escudo ESCOM"
              style={{ width: 115, height: "auto" }}
            />
          </Box>
        </Box>

        <Typography variant="body1" paragraph align="center">
          Si necesita más información sobre la aplicación, favor de contactar a:
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={3}>
          {contacts.map((contact) => (
            <Box
              key={contact.email}
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <Avatar sx={{ bgcolor: "#7c3aed" }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {contact.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <a
                      href={`mailto:${contact.email}`}
                      style={{ color: isDarkMode ? "#fff" :"#3b0764", textDecoration: "underline" }}
                    >
                      {contact.email}
                    </a>
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Contact;

package com.risiko.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleApp_gibtKorrektStatusUndMessageZurueck() {
        AppException ex = new AppException(HttpStatus.CONFLICT, "Conflict message");

        ResponseEntity<Map<String, String>> response = handler.handleApp(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("error", "Conflict message");
    }

    @Test
    void handleIllegalArgument_gibt400MitMessageZurueck() {
        IllegalArgumentException ex = new IllegalArgumentException("Bad argument");

        ResponseEntity<Map<String, String>> response = handler.handleIllegalArgument(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsEntry("error", "Bad argument");
    }

    @Test
    void handleGeneric_gibt500MitStandardMessageZurueck() {
        Exception ex = new RuntimeException("Unexpected crash");

        ResponseEntity<Map<String, String>> response = handler.handleGeneric(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("error", "Ein unerwarteter Fehler ist aufgetreten.");
    }

    @Test
    void appException_getStatus_gibtStatusZurueck() {
        AppException ex = new AppException(HttpStatus.NOT_FOUND, "Not found");
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(ex.getMessage()).isEqualTo("Not found");
    }
}

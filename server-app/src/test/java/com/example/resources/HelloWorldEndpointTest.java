package com.example.resources;

/**
 * Created by asla on 08/09/2016.
 */
import com.example.api.Saying;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import com.example.resources.HelloWorldResource;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

public class HelloWorldEndpointTest {

    @Rule
    public final ResourceTestRule resources = ResourceTestRule.builder()
            .addResource(new HelloWorldResource("Hello, %s!", "world"))
            .build();

    @Test
    public void HelloWorldDropwizard() throws IOException{
        // The real response
        String response = resources.client().target("/hello-world").
                queryParam("name", "Dropwizard").request().get(String.class);

        // The expected json that will be returned
        String goldenJson = "{ \"id\": 1, \"content\": \"Hello, Dropwizard!\" }";

        ObjectMapper mapper = new ObjectMapper();
        Saying saying = mapper.readValue(response, Saying.class);
        Saying expected = mapper.readValue(goldenJson, Saying.class);

        assertThat(saying.getId()).
                isEqualTo(expected.getId()).
                isEqualTo(1);

        assertThat(saying.getContent()).
                isEqualTo(expected.getContent()).
                isEqualTo("Hello, Dropwizard!");
    }

    @Test
    public void HelloWorldAbsentName() throws IOException{
        String response = resources.client().target("/hello-world").
                request().get(String.class);

        String goldenJson = "{ \"id\": 1, \"content\": \"Hello, world!\" }";

        ObjectMapper mapper = new ObjectMapper();
        Saying saying = mapper.readValue(response, Saying.class);
        Saying expected = mapper.readValue(goldenJson, Saying.class);

        assertThat(saying.getId()).
                isEqualTo(expected.getId()).
                isEqualTo(1);

        assertThat(saying.getContent()).
                isEqualTo(expected.getContent()).
                isEqualTo("Hello, world!");
    }
}

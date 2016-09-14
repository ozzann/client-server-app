package com.example;

/**
 * Created by asla on 08/09/2016.
 */

import com.example.api.Saying;

import io.dropwizard.testing.ResourceHelpers;
import io.dropwizard.testing.junit.DropwizardAppRule;
import org.glassfish.jersey.client.JerseyClientBuilder;
import org.junit.Rule;
import org.junit.Test;

import javax.ws.rs.client.Client;

import static org.assertj.core.api.Assertions.assertThat;

public class HelloWorldIntegrationTest {

    @Rule
    public final DropwizardAppRule<HelloWorldConfiguration> RULE =
            new DropwizardAppRule<HelloWorldConfiguration>(HelloWorldApplication.class,
                    ResourceHelpers.resourceFilePath("config.yml"));


    @Test
    public void runServerTest() {
        Client client = new JerseyClientBuilder().build();

        Saying result = client.target(
                String.format("http://localhost:%d/hello-world", RULE.getLocalPort())).
                queryParam("name", "dropwizard").request().get(Saying.class);

        assertThat(result.getContent()).isEqualTo("Hello, dropwizard!");
    }
}

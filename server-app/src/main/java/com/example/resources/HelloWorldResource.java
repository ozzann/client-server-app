package com.example.resources;

/**
 * Created by asla on 07/09/2016.
 */
import com.example.api.Saying;
import com.codahale.metrics.annotation.Timed;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.concurrent.atomic.AtomicLong;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/hello-world")
@Produces(MediaType.APPLICATION_JSON)
public class HelloWorldResource {
    private final String template;
    private final String defaultName;
    private final AtomicLong counter;

    final static Logger logger = LoggerFactory.getLogger(HelloWorldResource.class);

    public HelloWorldResource(String template, String defaultName) {
        this.template = template;
        this.defaultName = defaultName;
        this.counter = new AtomicLong();
    }

    @GET
    public Saying sayHello(@QueryParam("name") Optional<String> name) {
        logger.info("GET /hello-world");
        final String value = String.format(template, name.orElse(defaultName));

        return new Saying(counter.incrementAndGet(), value);
    }

}

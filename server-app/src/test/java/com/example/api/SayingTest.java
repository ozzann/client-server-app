package com.example.api;

import org.junit.Test;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Created by asla on 08/09/2016.
 */
public class SayingTest {

    @Test
    public void getIdTest(){
        Saying saying = new Saying(2, "Hello, world");
        assertThat(saying.getId()).isEqualTo(2);
    }

    @Test
    public void getContentTest() {
        Saying saying = new Saying(1, "Hello, content!");
        assertThat(saying.getContent()).isEqualTo("Hello, content!");
    }

}

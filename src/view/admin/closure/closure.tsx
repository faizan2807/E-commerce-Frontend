import {
    Box,
    Flex,
    Image,
} from "@chakra-ui/react";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

interface CarouselProps {
    images: string[];
}

export default function Carousel({ images }: CarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true },
    );
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };

        emblaApi.on("select", onSelect);
        onSelect();

        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi]);

    return (
        <Box position="relative" w="100%" maxW="1920px" mx="auto" overflow="hidden">
            {/* Carousel Slides */}
            <Box ref={emblaRef} overflow="hidden" w="100%">
                <Flex>
                    {images.map((image, index) => {

                        return (
                            <Box key={index} flex="0 0 100%" minW={0} position="relative">
                                <Image
                                    src={image}
                                    alt={`Hero banner ${index + 1}`}
                                    w="100%"
                                    maxW="2000px"
                                    h={{ base: "220px", sm: "320px", md: "460px", lg: "580px", xl: "650px" }}
                                    maxH="400px"
                                    aspectRatio={{ base: "16/9", md: "1920/650" }}
                                    objectFit="cover"
                                    objectPosition="center"
                                    transition="transform 0.4s ease"
                                />
                            </Box>
                        );
                    })}
                </Flex>
            </Box>
            {/* Overlaid Sleek Pagination Dots */}
            {/* <HStack
                position="absolute"
                bottom={{ base: "10px", md: "16px" }}
                left="50%"
                transform="translateX(-50%)"
                bg="blackAlpha.500"
                backdropFilter="blur(8px)"
                px={3}
                py={1.5}
                borderRadius="full"
                spacing={2}
                zIndex={2}
            >
                {images.map((_, index) => (
                    <Box
                        key={index}
                        w={selectedIndex === index ? "22px" : "8px"}
                        h="8px"
                        borderRadius="full"
                        bg={selectedIndex === index ? "white" : "whiteAlpha.600"}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        cursor="pointer"
                        _hover={{ bg: "white" }}
                        onClick={() => emblaApi?.scrollTo(index)}
                    />
                ))}
            </HStack> */}
        </Box>
    );
}
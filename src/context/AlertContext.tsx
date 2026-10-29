import React, { createContext, useContext, useState, useCallback } from "react";
import {
    Box,
    Flex,
    Text,
    Button,
    IconButton,
    ScaleFade,
} from "@chakra-ui/react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type AlertStatus = "success" | "error" | "warning" | "info";

export interface AlertOptions {
    title: string;
    description?: string;
    status?: AlertStatus;
    duration?: number;
    buttonText?: string;
    onConfirm?: () => void;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alert, setAlert] = useState<AlertOptions | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const closeAlert = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => setAlert(null), 200);
    }, []);

    const showAlert = useCallback(
        ({
            title,
            description,
            status = "success",
            duration = 3000,
            buttonText = "OK",
            onConfirm,
        }: AlertOptions) => {
            setAlert({ title, description, status, duration, buttonText, onConfirm });
            setIsOpen(true);

            if (duration && duration > 0) {
                setTimeout(() => {
                    setIsOpen(false);
                    setTimeout(() => setAlert(null), 200);
                }, duration);
            }
        },
        []
    );

    const getStatusConfig = (status: AlertStatus = "success") => {
        switch (status) {
            case "success":
                return {
                    icon: <CheckCircle2 size={36} color="#16a34a" />,
                    bg: "#f0fdf4",
                    border: "#bbf7d0",
                    btnScheme: "green",
                };
            case "error":
                return {
                    icon: <XCircle size={36} color="#dc2626" />,
                    bg: "#fef2f2",
                    border: "#fecaca",
                    btnScheme: "red",
                };
            case "warning":
                return {
                    icon: <AlertTriangle size={36} color="#ea580c" />,
                    bg: "#fff7ed",
                    border: "#fed7aa",
                    btnScheme: "orange",
                };
            case "info":
            default:
                return {
                    icon: <Info size={36} color="#2563eb" />,
                    bg: "#eff6ff",
                    border: "#bfdbfe",
                    btnScheme: "blue",
                };
        }
    };

    const statusConfig = alert ? getStatusConfig(alert.status) : getStatusConfig("info");

    return (
        <AlertContext.Provider value={{ showAlert, closeAlert }}>
            {children}

            {isOpen && alert && (
                <Flex
                    position="fixed"
                    inset={0}
                    zIndex={99999}
                    align="center"
                    justify="center"
                    bg="blackAlpha.600"
                    backdropFilter="blur(5px)"
                    p={4}
                    onClick={closeAlert}
                >
                    <ScaleFade in={isOpen} initialScale={0.85}>
                        <Box
                            bg="white"
                            borderRadius="2xl"
                            boxShadow="2xl"
                            p={6}
                            maxW="420px"
                            w="100%"
                            textAlign="center"
                            position="relative"
                            onClick={(e) => e.stopPropagation()}
                            border="1px solid"
                            borderColor="gray.100"
                        >
                            <IconButton
                                aria-label="Close"
                                icon={<X size={18} />}
                                size="sm"
                                variant="ghost"
                                position="absolute"
                                top={3}
                                right={3}
                                borderRadius="full"
                                onClick={closeAlert}
                            />

                            <Flex
                                align="center"
                                justify="center"
                                w="64px"
                                h="64px"
                                borderRadius="full"
                                bg={statusConfig.bg}
                                border="2px solid"
                                borderColor={statusConfig.border}
                                mx="auto"
                                mb={4}
                            >
                                {statusConfig.icon}
                            </Flex>

                            <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={alert.description ? 2 : 4}>
                                {alert.title}
                            </Text>

                            {alert.description && (
                                <Text fontSize="sm" color="gray.600" mb={5} lineHeight="tall">
                                    {alert.description}
                                </Text>
                            )}

                            <Button
                                colorScheme={statusConfig.btnScheme}
                                size="md"
                                w="100%"
                                borderRadius="xl"
                                onClick={() => {
                                    alert.onConfirm?.();
                                    closeAlert();
                                }}
                            >
                                {alert.buttonText || "OK"}
                            </Button>
                        </Box>
                    </ScaleFade>
                </Flex>
            )}
        </AlertContext.Provider>
    );
};

export const useCenterAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useCenterAlert must be used within an AlertProvider");
    }
    return context;
};

"""This module contains the IeeeAssistant class, which initializes and manages
the configuration and execution of an assistant model."""

import dataclasses
import os
from typing import Any, Dict, List

from langchain.chat_models.base import BaseChatModel
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_google_genai import ChatGoogleGenerativeAI

from src.settings import Settings
from src.utils.yaml import read_yaml_file

# ASSISTANT_CONFIG_PATH = Settings().ASSISTANT_CONFIG_PATH


@dataclasses.dataclass
class LLMConfig:
    """
    LLMConfig is a data class that holds the configuration for a language model

    Attributes:
        sys_prompt (str): The system prompt to be used by the language model.
        model (str): The name or identifier of the language model.
        temperature (float): The temperature parameter for the language model,
        which controls the randomness of the output.
    """

    sys_prompt: str
    model: str
    temperature: float


class IAgoAssistant:
    """
    IAgoAssistant is a class that initializes and manages the configuration and
    execution of an assistant model.

    Attributes:
        configs (List[dict[str, Any]]): List of configuration dictionaries.
        assistant_config (dict[str, Any]): Dictionary containing assistant
        configuration.
        sys_prompt (str): System message prompt template.
        llm_model (str): Language model identifier.
        llm_temperature (float): Temperature setting for the language model.

    Methods:
        get_configs(config_path: str) -> List[dict[str, Any]]:
            Static method to retrieve configurations from a given path.

        get_assistant_config() -> List[dict[str, Any]]:
            Retrieves the assistant configuration from the loaded configs.

        get_llm_model() -> str:
            Retrieves and initializes the language model based on the
            configuration.

        get_assistant():
            Initializes the assistant with the language model and prompt
            templates.

        run_assistant(inputs: str):
            Runs the assistant with the given input and retrieves the response.
    """

    def __init__(self):
        self.configs = self.get_configs()
        self.assistant_config = self.get_assistant_config()
        self.llm_config = LLMConfig(
            sys_prompt=self.assistant_config.get('system_message'),
            model=self.assistant_config.get('model'),
            temperature=self.assistant_config.get('temperature'),
        )
        self.tools = self.assistant_config.get('tools')

    @staticmethod
    def get_configs(
        config_path: str = Settings().ASSISTANT_CONFIG_PATH,  # type: ignore
    ) -> List[Dict[str, Any]]:
        """
        Retrieves configuration data from YAML files located at the specified
        path.

        Args:
            config_path (str): The path to a directory containing YAML files or
            a single YAML file.

        Returns:
            List[dict[str, Any]]: A list of dictionaries containing the
            configuration data.

        Raises:
            ValueError: If the provided config_path is neither a directory nor
            a YAML file.
        """
        configs = []
        if os.path.isdir(config_path):
            for filename in os.listdir(config_path):
                if filename.endswith('.yaml'):
                    filepath = os.path.join(config_path, filename)
                    configs.append(read_yaml_file(filepath))
        elif os.path.isfile(config_path) and config_path.endswith('.yaml'):
            configs.append(read_yaml_file(config_path))
        else:
            raise ValueError(f'Invalid config path: {config_path}')
        return configs

    def get_assistant_config(self) -> List[dict[str, Any]]:
        """
        Retrieve the assistant configuration.

        Returns:
            List[dict[str, Any]]: A list of dictionaries containing the
            assistant configuration.
        """
        return self.configs[0].get('config')

    def get_llm_model(self) -> BaseChatModel:
        """
        Returns the appropriate LLM model instance based on the configuration.

        If the model specified in the configuration is 'gemini', it returns an
        instance
        of ChatGoogleGenerativeAI with the specified model and temperature
        settings.
        Otherwise, it raises a ValueError indicating that the model is invalid
        or not supported.

        Returns:
            str: An instance of ChatGoogleGenerativeAI if the model is 'gemini'

        Raises:
            ValueError: If the model specified in the configuration is invalid
            or not supported.
        """
        if 'gemini' in self.llm_config.model:
            return ChatGoogleGenerativeAI(
                model=f'{self.llm_config.model}',
                temperature=self.llm_config.temperature,
                api_key=Settings().GOOGLE_API_KEY,  # type: ignore
            )
        else:
            raise ValueError(
                f'Invalid LLM model: {self.llm_config.model}, or not supported'
            )

    def get_assistant(self):
        """
        Initializes the assistant by setting up the language model (LLM) and
        creating a prompt template.

        This method performs the following steps:

        1. Retrieves the LLM model using the `get_llm_model` method and
        assigns it to `self._llm`.

        2. Constructs a list of message templates for the assistant's prompt,
        including system and human message templates.

        3. Defines the input variables required for the prompt.

        4. Creates a `ChatPromptTemplate` using the defined messages and
        input variables.

        5. Initializes the assistant by creating a document chain with the
        LLM and the prompt template.

        Returns:
            None
        """
        if not hasattr(self, 'assistant') or not hasattr(self, '_llm'):
            llm = self.get_llm_model()
            self._llm = llm

            messages = [
                SystemMessagePromptTemplate.from_template(
                    self.llm_config.sys_prompt
                ),
                HumanMessagePromptTemplate.from_template(
                    'Gere o feedback para o colaborador'
                ),
                # MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
            input_variables = [
                'colaborador_q1',
                'colaborador_q1_justificativa',
                'colaborador_q2',
                'colaborador_q2_justificativa',
                'colaborador_q3',
                'colaborador_q3_justificativa',
                'colaborador_q4',
                'colaborador_q4_justificativa',
                'colaborador_q5',
                'colaborador_q5_justificativa',
                'colaborador_q6',
                'colaborador_q6_justificativa',
                'colaborador_q7',
                'colaborador_q7_justificativa',
                'colaborador_q8',
                'colaborador_q8_justificativa',
                'colaborador_q9',
                'colaborador_q9_justificativa',
                'colaborador_q10',
                'colaborador_q10_justificativa',
                'gestor_q1',
                'gestor_q1_justificativa',
                'gestor_q2',
                'gestor_q2_justificativa',
                'gestor_q3',
                'gestor_q3_justificativa',
                'gestor_q4',
                'gestor_q4_justificativa',
                'gestor_q5',
                'gestor_q5_justificativa',
                'gestor_q6',
                'gestor_q6_justificativa',
                'gestor_q7',
                'gestor_q7_justificativa',
                'gestor_q8',
                'gestor_q8_justificativa',
                'gestor_q9',
                'gestor_q9_justificativa',
                'gestor_q10',
                'gestor_q10_justificativa',
                'final_q1',
                'final_q2',
                'final_q3',
                'final_q4',
                'final_q5',
                'final_q6',
                'final_q7',
                'final_q8',
                'final_q9',
                'final_q10',
                'nome_colaborador',
            ]

            _prompt = ChatPromptTemplate(
                messages=messages, input_variables=input_variables
            )

            self.assistant = _prompt | self._llm | StrOutputParser()
            print('Assistant initialized')

    def run_assistant(self, inputs: dict):
        """
        Runs the assistant with the given input string.

        This method retrieves relevant documents based on the input string and
        invokes the assistant with the input and the retrieved context.

        Args:
            inputs (dict): The input string to process.

        Returns:
            The response from the assistant.

        Raises:
            ValueError: If the assistant is not initialized.
        """
        if not hasattr(self, 'assistant'):
            raise ValueError('Assistant not initialized')
        # print('Contexto:', docs)

        response = self.assistant.invoke({
            'colaborador_q1': inputs.get('colaborador_q1'),
            'colaborador_q1_justificativa': inputs.get(
                'colaborador_q1_justificativa'
            ),
            'colaborador_q2': inputs.get('colaborador_q2'),
            'colaborador_q2_justificativa': inputs.get(
                'colaborador_q2_justificativa'
            ),
            'colaborador_q3': inputs.get('colaborador_q3'),
            'colaborador_q3_justificativa': inputs.get(
                'colaborador_q3_justificativa'
            ),
            'colaborador_q4': inputs.get('colaborador_q4'),
            'colaborador_q4_justificativa': inputs.get(
                'colaborador_q4_justificativa'
            ),
            'colaborador_q5': inputs.get('colaborador_q5'),
            'colaborador_q5_justificativa': inputs.get(
                'colaborador_q5_justificativa'
            ),
            'colaborador_q6': inputs.get('colaborador_q6'),
            'colaborador_q6_justificativa': inputs.get(
                'colaborador_q6_justificativa'
            ),
            'colaborador_q7': inputs.get('colaborador_q7'),
            'colaborador_q7_justificativa': inputs.get(
                'colaborador_q7_justificativa'
            ),
            'colaborador_q8': inputs.get('colaborador_q8'),
            'colaborador_q8_justificativa': inputs.get(
                'colaborador_q8_justificativa'
            ),
            'colaborador_q9': inputs.get('colaborador_q9'),
            'colaborador_q9_justificativa': inputs.get(
                'colaborador_q9_justificativa'
            ),
            'colaborador_q10': inputs.get('colaborador_q10'),
            'colaborador_q10_justificativa': inputs.get(
                'colaborador_q10_justificativa'
            ),
            'gestor_q1': inputs.get('gestor_q1'),
            'gestor_q1_justificativa': inputs.get('gestor_q1_justificativa'),
            'gestor_q2': inputs.get('gestor_q2'),
            'gestor_q2_justificativa': inputs.get('gestor_q2_justificativa'),
            'gestor_q3': inputs.get('gestor_q3'),
            'gestor_q3_justificativa': inputs.get('gestor_q3_justificativa'),
            'gestor_q4': inputs.get('gestor_q4'),
            'gestor_q4_justificativa': inputs.get('gestor_q4_justificativa'),
            'gestor_q5': inputs.get('gestor_q5'),
            'gestor_q5_justificativa': inputs.get('gestor_q5_justificativa'),
            'gestor_q6': inputs.get('gestor_q6'),
            'gestor_q6_justificativa': inputs.get('gestor_q6_justificativa'),
            'gestor_q7': inputs.get('gestor_q7'),
            'gestor_q7_justificativa': inputs.get('gestor_q7_justificativa'),
            'gestor_q8': inputs.get('gestor_q8'),
            'gestor_q8_justificativa': inputs.get('gestor_q8_justificativa'),
            'gestor_q9': inputs.get('gestor_q9'),
            'gestor_q9_justificativa': inputs.get('gestor_q9_justificativa'),
            'gestor_q10': inputs.get('gestor_q10'),
            'gestor_q10_justificativa': inputs.get('gestor_q10_justificativa'),
            'final_q1': inputs.get('final_q1'),
            'final_q2': inputs.get('final_q2'),
            'final_q3': inputs.get('final_q3'),
            'final_q4': inputs.get('final_q4'),
            'final_q5': inputs.get('final_q5'),
            'final_q6': inputs.get('final_q6'),
            'final_q7': inputs.get('final_q7'),
            'final_q8': inputs.get('final_q8'),
            'final_q9': inputs.get('final_q9'),
            'final_q10': inputs.get('final_q10'),
            'nome_colaborador': inputs.get('nome_colaborador'),
        })
        return response
